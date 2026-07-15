import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

const isTest = process.env.NODE_ENV === "test";
const connectionString = isTest
  ? process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured in environmental variables.");
}

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });
  }
  prisma = global.cachedPrisma;
}

export { prisma };
