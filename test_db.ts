import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.$queryRaw`DESCRIBE forum_registrations`;
  console.log(res);
}

main().finally(() => prisma.$disconnect());
