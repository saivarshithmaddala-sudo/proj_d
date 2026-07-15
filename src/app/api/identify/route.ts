import { prisma } from "@/lib/db";
import { apiError, handleServerError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, Contact } from "@prisma/client";

// Zod schema for request validation. Coerces phoneNumber to string if passed as number.
const identifySchema = z.object({
  email: z.string().email().nullable().optional(),
  phoneNumber: z
    .union([z.string(), z.number()])
    .transform((val) => (val === null || val === undefined ? val : String(val)))
    .nullable()
    .optional(),
});

const MAX_RETRIES = 3;

async function executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: unknown) {
      attempt++;
      const err = error as { code?: number | string; message?: string };
      // Check for transient MongoDB write conflicts / transaction failures (code 112 is WriteConflict)
      const isTransientError =
        err.code === 112 ||
        (err.message && err.message.includes("WriteConflict")) ||
        err.code === "P2034"; // Fallback Prisma code

      if (isTransientError && attempt < MAX_RETRIES) {
        console.warn(`Write conflict detected in MongoDB. Retrying attempt ${attempt}...`);
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = identifySchema.safeParse(body);
    
    if (!parseResult.success) {
      return apiError(
        "INVALID_REQUEST",
        "Invalid request schema. Provide a valid email and phone number.",
        400
      );
    }

    const { email, phoneNumber } = parseResult.data;

    if (!email && !phoneNumber) {
      return apiError(
        "INVALID_REQUEST",
        "Provide at least one of email or phoneNumber.",
        400
      );
    }

    const result = await executeWithRetry(() =>
      prisma.$transaction(async (tx) => {
        // Step 1: Find all matching contacts (matching email OR phoneNumber)
        const matches = await tx.contact.findMany({
          where: {
            OR: [
              email ? { email } : undefined,
              phoneNumber ? { phoneNumber } : undefined,
            ].filter(Boolean) as Prisma.ContactWhereInput[],
            deletedAt: null,
          },
        });

        // Helper to recursively resolve a secondary contact to its root primary contact (MongoDB ID is string)
        const resolvePrimary = async (
          contactId: string,
          hopCount = 0
        ): Promise<Contact> => {
          if (hopCount > 10) {
            throw new Error("Recursive limit exceeded resolving primary contact.");
          }
          const contact = await tx.contact.findUnique({
            where: { id: contactId },
          });
          if (!contact) {
            throw new Error(`Contact not found with ID: ${contactId}`);
          }
          if (contact.linkPrecedence === "primary") {
            return contact;
          }
          if (!contact.linkedId) {
            return contact; // Defensive fallback
          }
          return resolvePrimary(contact.linkedId, hopCount + 1);
        };

        if (matches.length === 0) {
          // Brand new identity
          const newContact = await tx.contact.create({
            data: {
              email: email || null,
              phoneNumber: phoneNumber || null,
              linkPrecedence: "primary",
              linkedId: null,
              deletedAt: null,
            },
          });
          return {
            primary: newContact,
            secondaries: [],
          };
        }

        // Step 2: Resolve every match to its root primary contact ID
        const rootIdSet = new Set<string>();
        for (const m of matches) {
          if (m.linkPrecedence === "primary") {
            rootIdSet.add(m.id);
          } else if (m.linkedId) {
            const root = await resolvePrimary(m.linkedId);
            rootIdSet.add(root.id);
          }
        }

        const rootIds = Array.from(rootIdSet);
        let primaryContact: Contact | null = null;

        // Step 3: If matches span multiple distinct primary clusters, merge them
        if (rootIds.length > 1) {
          // Retrieve all matching primaries ordered by createdAt asc (oldest wins)
          const primaries = await tx.contact.findMany({
            where: { id: { in: rootIds } },
            orderBy: { createdAt: "asc" },
          });

          const oldestPrimary = primaries[0];
          const youngerPrimaries = primaries.slice(1);

          for (const p of youngerPrimaries) {
            // Convert younger primary to secondary of the oldest primary
            await tx.contact.update({
              where: { id: p.id },
              data: {
                linkPrecedence: "secondary",
                linkedId: oldestPrimary.id,
              },
            });

            // Cascade: repoint all contacts linking to the younger primary to the oldest primary
            await tx.contact.updateMany({
              where: { linkedId: p.id },
              data: { linkedId: oldestPrimary.id },
            });
          }
          primaryContact = oldestPrimary;
        } else {
          // Only 1 cluster is involved
          primaryContact = await tx.contact.findUnique({
            where: { id: rootIds[0] },
          });
        }

        if (!primaryContact) {
          throw new Error("Could not resolve primary contact");
        }

        // Step 4: Gather the full cluster (primary + all its secondaries)
        const cluster = await tx.contact.findMany({
          where: {
            OR: [
              { id: primaryContact.id },
              { linkedId: primaryContact.id },
            ],
            deletedAt: null,
          },
        });

        // Step 5: Check if the incoming request introduces new info
        const knownEmails = new Set(cluster.map((c) => c.email).filter(Boolean) as string[]);
        const knownPhones = new Set(cluster.map((c) => c.phoneNumber).filter(Boolean) as string[]);

        const isNewEmail = email && !knownEmails.has(email);
        const isNewPhone = phoneNumber && !knownPhones.has(phoneNumber);

        if (isNewEmail || isNewPhone) {
          const newSecondary = await tx.contact.create({
            data: {
              email: email || null,
              phoneNumber: phoneNumber || null,
              linkPrecedence: "secondary",
              linkedId: primaryContact.id,
              deletedAt: null,
            },
          });
          cluster.push(newSecondary);
        }

        // Separate primary from secondaries and sort secondaries by createdAt ascending
        const secondaries = cluster
          .filter((c) => c.id !== primaryContact.id)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        return {
          primary: primaryContact,
          secondaries,
        };
      })
    );

    // Build consolidated response matching Section 3.2
    const emailsSet = new Set<string>();
    if (result.primary.email) {
      emailsSet.add(result.primary.email);
    }
    for (const s of result.secondaries) {
      if (s.email) {
        emailsSet.add(s.email);
      }
    }

    const phonesSet = new Set<string>();
    if (result.primary.phoneNumber) {
      phonesSet.add(result.primary.phoneNumber);
    }
    for (const s of result.secondaries) {
      if (s.phoneNumber) {
        phonesSet.add(s.phoneNumber);
      }
    }

    const secondaryContactIds = result.secondaries.map((s) => s.id);

    return NextResponse.json({
      contact: {
        primaryContactId: result.primary.id,
        emails: Array.from(emailsSet),
        phoneNumbers: Array.from(phonesSet),
        secondaryContactIds,
      },
    });
  } catch (error) {
    return handleServerError(error);
  }
}
