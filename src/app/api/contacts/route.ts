import { prisma } from "@/lib/db";
import { handleServerError } from "@/lib/apiError";
import { NextResponse } from "next/server";
import { Contact } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    
    let primaryIds: string[] = [];

    if (search) {
      // Find matching contacts by email or phone number (mode insensitive is supported in MongoDB)
      const matches = await prisma.contact.findMany({
        where: {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search, mode: "insensitive" } },
          ],
          deletedAt: null,
        },
        select: {
          id: true,
          linkedId: true,
          linkPrecedence: true,
        },
      });

      const rootIds = new Set<string>();
      for (const m of matches) {
        if (m.linkPrecedence === "primary") {
          rootIds.add(m.id);
        } else if (m.linkedId) {
          rootIds.add(m.linkedId);
        }
      }
      primaryIds = Array.from(rootIds);
    }

    let contacts: Contact[] = [];
    if (search) {
      if (primaryIds.length > 0) {
        contacts = await prisma.contact.findMany({
          where: {
            OR: [
              { id: { in: primaryIds } },
              { linkedId: { in: primaryIds } },
            ],
            deletedAt: null,
          },
          orderBy: { createdAt: "asc" },
        });
      }
    } else {
      // Get all contacts
      contacts = await prisma.contact.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
    }

    // Group contacts into clusters in memory
    const primariesMap = new Map<string, Contact>();
    const secondariesMap = new Map<string, Contact[]>();

    // First collect all primaries
    for (const c of contacts) {
      if (c.linkPrecedence === "primary") {
        primariesMap.set(c.id, c);
        if (!secondariesMap.has(c.id)) {
          secondariesMap.set(c.id, []);
        }
      }
    }

    // Then collect secondaries and associate with their primary
    for (const c of contacts) {
      if (c.linkPrecedence === "secondary" && c.linkedId) {
        const list = secondariesMap.get(c.linkedId) || [];
        list.push(c);
        secondariesMap.set(c.linkedId, list);
      }
    }

    // Build the final cluster response array
    const clusters: { primary: Contact; secondaries: Contact[] }[] = [];
    primariesMap.forEach((primary, primaryId) => {
      const secondaries = secondariesMap.get(primaryId) || [];
      clusters.push({
        primary,
        secondaries: secondaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      });
    });

    // Sort clusters by primary creation date (newest first for dashboard)
    clusters.sort((a, b) => b.primary.createdAt.getTime() - a.primary.createdAt.getTime());

    return NextResponse.json({ clusters });
  } catch (error) {
    return handleServerError(error);
  }
}
