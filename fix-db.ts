import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fix() {
  await prisma.$executeRaw`UPDATE users SET kycStatus = 'not_submitted' WHERE kycStatus = ''`;
  await prisma.$executeRaw`UPDATE users SET status = 'active' WHERE status = ''`;
  console.log("Fixed other empty enums in DB!");
  process.exit(0);
}
fix();
