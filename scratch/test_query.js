const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Attempting to connect to MongoDB and query contacts...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")); // Mask password
  const c = await prisma.contact.findMany();
  console.log("Connection successful!");
  console.log("Total contacts in DB:", c.length);
  process.exit(0);
}

main().catch((err) => {
  console.error("Connection failed with error:");
  console.error(err);
  process.exit(1);
});
