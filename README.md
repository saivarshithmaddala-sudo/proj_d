# Zamazon Identity Engine — Identity Reconciliation Service

A production-quality full-stack web application built to solve the classic **identity reconciliation** problem: given a stream of customer contact requests carrying an `email` and/or `phoneNumber`, consolidate all contact records belonging to the same real person into a single identity cluster, even when no single request shares both fields with any other.

---

## 1. Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict type checking)
- **Styling:** Tailwind CSS (premium dark "control room" theme)
- **Database:** MongoDB Atlas (replica set cluster supporting native transactions)
- **ORM:** Prisma v6
- **Validation:** Zod (body validation on API routes, parameter type coercions)
- **Testing:** Vitest (10 integration and edge-case scenarios)
- **Icons:** Lucide React

---

## 2. Core Algorithm & Design Decisions

### 2.1 The Reconciliation Algorithm (`/api/identify`)
When a request carrying an `email` and/or `phoneNumber` is received:
1. **Match Detection:** The engine searches for all existing contacts containing either the given email or phone number.
2. **Root Resolution:** For each matching contact, the engine recursively walks its parent chain (via the `linkedId` foreign key) to resolve the root `primary` contact of its identity cluster.
3. **Cluster Merging:** If the matching contacts belong to multiple distinct primary clusters, the older primary contact (by `createdAt`) remains as the survivor. All other younger primaries are updated to `secondary` precedence, and their `linkedId` is updated to point directly to the surviving primary. Any secondary contacts linking to the younger primaries are cascade-updated to point directly to the surviving primary (keeping the identity graph exactly 2 levels deep).
4. **New Info Detection:** If the request introduces a new email or phone number not yet present in the cluster, a new `secondary` contact is created and added to the cluster.
5. **Exact-Duplicate Short-circuit:** If the incoming `(email, phoneNumber)` is already fully represented in the cluster (e.g. byte-for-byte duplicate of an existing record), no new record is created.

### 2.2 Concurrency & Race-Condition Handling
To prevent duplicate primary contacts when two identical requests for a new identity occur simultaneously:
- The core reconciliation sequence is wrapped in a Prisma interactive transaction (`prisma.$transaction`).
- We wrap the transaction block in a retry helper (`executeWithRetry`) with a maximum of 3 attempts.
- If a transient write conflict (MongoDB error code `112` or write conflict message) is encountered, the transaction is aborted, a short random delay is introduced to prevent live-locks, and the execution is retried. On the retry, the matches search will find the newly created primary contact, preventing duplicate primary creation.

### 2.3 MongoDB Integration
Initially configured for PostgreSQL, this application was successfully converted to **MongoDB Atlas** per specifications. Since MongoDB requires replica sets for transactions (supported out-of-the-box by Atlas), we use Prisma's MongoDB connector. MongoDB ObjectIds are represented as 24-character hexadecimal `string` identifiers.

---

## 3. Local Setup & Installation

### 3.1 Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)

### 3.2 Installation Steps

1. **Clone the repository and open the workspace:**
   ```bash
   cd "d:/proj d"
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   # Connection string for the development database (MongoDB Atlas)
   DATABASE_URL="mongodb+srv://proj_d:proj_d@clusterprojd.iwmxhrr.mongodb.net/zamazon_identity_dev?retryWrites=true&w=majority&appName=Clusterprojd"

   # Connection string for the test database (MongoDB Atlas)
   DATABASE_URL_TEST="mongodb+srv://proj_d:proj_d@clusterprojd.iwmxhrr.mongodb.net/zamazon_identity_test?retryWrites=true&w=majority&appName=Clusterprojd"
   ```

4. **Sync Database Schema and Collections:**
   Generate the Prisma Client and create database collections and indexes on MongoDB:
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the playground.

### 3.3 Deployed Live URL
The application is deployed on Vercel and is live at:
**[https://zamazon-identity-engine.vercel.app](https://zamazon-identity-engine.vercel.app)**

---

## 4. Running Integration Tests

The integration test suite covers all 10 edge-case scenarios listed in the specification:
1. Brand-new email+phone creates primary contact.
2. Sharing only email creates a secondary contact.
3. Sharing only phone creates a secondary contact.
4. Request matching only email returns existing cluster.
5. Request matching only phone returns existing cluster.
6. Merging two separate clusters (older primary wins).
7. Exact duplicate request does not create new records.
8. Empty request returns 400 error.
9. Coercing integer phone numbers to strings.
10. Concurrent requests resolution (race-condition check).

To run the Vitest suite:
```bash
npm run test
```

---

## 5. API Reference

### POST `/api/identify`
Core reconciliation endpoint.
- **Request Body:**
  ```json
  {
    "email": "customer@email.com",
    "phoneNumber": "1234567890"
  }
  ```
- **Response Shape:**
  ```json
  {
    "contact": {
      "primaryContactId": "6a57513abef03e2648797dce",
      "emails": ["customer@email.com", "secondary@email.com"],
      "phoneNumbers": ["1234567890"],
      "secondaryContactIds": ["6a57513bbef03e2648797dd0"]
    }
  }
  ```

### GET `/api/contacts`
Admin console grouping endpoint. Returns all contacts grouped into clusters.
- **Query Params:** `search` (optional) to filter by email/phone.

### GET `/api/health`
Liveness check returning `{ "status": "ok" }`.
