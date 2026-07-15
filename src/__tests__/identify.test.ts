import { POST } from "@/app/api/identify/route";
import { prisma } from "@/lib/db";
import { expect, test, describe, beforeEach } from "vitest";

describe("Identity Reconciliation /api/identify", () => {
  beforeEach(async () => {
    // Clean the database before each test safely by deleting secondaries first
    await prisma.contact.deleteMany({ where: { linkPrecedence: "secondary" } });
    await prisma.contact.deleteMany({ where: { linkPrecedence: "primary" } });
  });

  // Helper to make mock requests directly to the Next.js API route handler
  async function makeRequest(payload: Record<string, unknown>) {
    const req = new Request("http://localhost/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const res = await POST(req);
    const data = await res.json();
    return { status: res.status, data };
  }

  // 1. First-ever request for a brand-new email+phone -> creates primary.
  test("1. First-ever request creates a primary contact", async () => {
    const { status, data } = await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    expect(status).toBe(200);
    expect(data.contact).toBeDefined();
    expect(data.contact.primaryContactId).toBeTypeOf("string");
    expect(data.contact.emails).toEqual(["doc@timetravel.com"]);
    expect(data.contact.phoneNumbers).toEqual(["1234567890"]);
    expect(data.contact.secondaryContactIds).toEqual([]);

    const dbContacts = await prisma.contact.findMany();
    expect(dbContacts.length).toBe(1);
    expect(dbContacts[0].linkPrecedence).toBe("primary");
  });

  // 2. Second request shares only email, new phone -> creates secondary, response includes both phones.
  test("2. Second request with same email but new phone creates a secondary contact", async () => {
    await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    const { status, data } = await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "0987654321",
    });

    expect(status).toBe(200);
    expect(data.contact.emails).toEqual(["doc@timetravel.com"]);
    expect(data.contact.phoneNumbers).toEqual(["1234567890", "0987654321"]);
    expect(data.contact.secondaryContactIds.length).toBe(1);

    const dbContacts = await prisma.contact.findMany({ orderBy: { createdAt: "asc" } });
    expect(dbContacts.length).toBe(2);
    expect(dbContacts[0].linkPrecedence).toBe("primary");
    expect(dbContacts[1].linkPrecedence).toBe("secondary");
    expect(dbContacts[1].linkedId).toBe(dbContacts[0].id);
  });

  // 3. Second request shares only phone, new email -> same, mirrored.
  test("3. Second request with same phone but new email creates a secondary contact", async () => {
    await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    const { status, data } = await makeRequest({
      email: "marty@future.com",
      phoneNumber: "1234567890",
    });

    expect(status).toBe(200);
    expect(data.contact.emails).toEqual(["doc@timetravel.com", "marty@future.com"]);
    expect(data.contact.phoneNumbers).toEqual(["1234567890"]);
    expect(data.contact.secondaryContactIds.length).toBe(1);
  });

  // 4. Request with only email (no phone) matching an existing contact.
  test("4. Request with only email matching an existing contact returns existing cluster without new records", async () => {
    await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    const { status, data } = await makeRequest({
      email: "doc@timetravel.com",
    });

    expect(status).toBe(200);
    expect(data.contact.emails).toEqual(["doc@timetravel.com"]);
    expect(data.contact.phoneNumbers).toEqual(["1234567890"]);
    expect(data.contact.secondaryContactIds).toEqual([]);

    const dbContacts = await prisma.contact.findMany();
    expect(dbContacts.length).toBe(1);
  });

  // 5. Request with only phoneNumber (no email) matching an existing contact.
  test("5. Request with only phoneNumber matching an existing contact returns existing cluster", async () => {
    await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    const { status, data } = await makeRequest({
      phoneNumber: "1234567890",
    });

    expect(status).toBe(200);
    expect(data.contact.emails).toEqual(["doc@timetravel.com"]);
    expect(data.contact.phoneNumbers).toEqual(["1234567890"]);

    const dbContacts = await prisma.contact.findMany();
    expect(dbContacts.length).toBe(1);
  });

  // 6. Two previously separate primary clusters are unified by one request that has cluster A's email and cluster B's phone
  test("6. Merges two separate clusters, older primary wins, younger primary becomes secondary", async () => {
    // Cluster 1 (older)
    const res1 = await makeRequest({
      email: "clusterA@example.com",
      phoneNumber: "111111",
    });
    const primaryAId = res1.data.contact.primaryContactId;

    // Simulate wait to guarantee distinct createdAt timestamps
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Cluster 2 (younger)
    const res2 = await makeRequest({
      email: "clusterB@example.com",
      phoneNumber: "222222",
    });
    const primaryBId = res2.data.contact.primaryContactId;

    expect(primaryAId).not.toBe(primaryBId);

    // Reconciling request linking cluster A's email and cluster B's phone
    const { status, data } = await makeRequest({
      email: "clusterA@example.com",
      phoneNumber: "222222",
    });

    expect(status).toBe(200);
    // Older primary (A) should win
    expect(data.contact.primaryContactId).toBe(primaryAId);
    expect(data.contact.emails).toContain("clusterA@example.com");
    expect(data.contact.emails).toContain("clusterB@example.com");
    expect(data.contact.phoneNumbers).toContain("111111");
    expect(data.contact.phoneNumbers).toContain("222222");

    // Cluster B's primary should now be listed as a secondary contact
    expect(data.contact.secondaryContactIds).toContain(primaryBId);

    const contactB = await prisma.contact.findUnique({ where: { id: primaryBId } });
    expect(contactB?.linkPrecedence).toBe("secondary");
    expect(contactB?.linkedId).toBe(primaryAId);
  });

  // 7. A request identical to data already fully represented in the cluster -> no new row created.
  test("7. Exact duplicate request does not create a new contact", async () => {
    await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    const { status, data } = await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: "1234567890",
    });

    expect(status).toBe(200);
    expect(data.contact.secondaryContactIds).toEqual([]);

    const dbContacts = await prisma.contact.findMany();
    expect(dbContacts.length).toBe(1);
  });

  // 8. Request with neither field -> 400 with a clear error message.
  test("8. Request with neither field returns 400 error", async () => {
    const { status, data } = await makeRequest({});
    expect(status).toBe(400);
    expect(data.error.code).toBe("INVALID_REQUEST");
    expect(data.error.message).toContain("Provide at least one of email or phoneNumber");
  });

  // 9. Request with malformed types (coerces phone number from integer to string).
  test("9. Coerces integer phone numbers to strings", async () => {
    const { status, data } = await makeRequest({
      email: "doc@timetravel.com",
      phoneNumber: 1234567890,
    });

    expect(status).toBe(200);
    expect(data.contact.phoneNumbers).toEqual(["1234567890"]);

    const dbContact = await prisma.contact.findFirst();
    expect(dbContact?.phoneNumber).toBe("1234567890");
  });

  // 10. Concurrent requests for the same new identity.
  test("10. Concurrent requests for a new identity resolve without duplicate primaries", async () => {
    const payload = {
      email: "race@example.com",
      phoneNumber: "9999999999",
    };

    // Trigger multiple requests concurrently
    const results = await Promise.all([
      makeRequest(payload),
      makeRequest(payload),
      makeRequest(payload),
    ]);

    for (const r of results) {
      expect(r.status).toBe(200);
      expect(r.data.contact.emails).toContain("race@example.com");
      expect(r.data.contact.phoneNumbers).toContain("9999999999");
    }

    const dbContacts = await prisma.contact.findMany({
      where: { email: "race@example.com" },
    });

    // There should be exactly one primary contact
    const primaries = dbContacts.filter((c) => c.linkPrecedence === "primary");
    expect(primaries.length).toBe(1);
  });
});
