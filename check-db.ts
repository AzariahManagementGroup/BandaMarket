import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const forumPayments = await prisma.$queryRaw`
        SELECT 
          id,
          'guest' as userId,
          name as fullName,
          email,
          'payment' as type,
          amount_paid as amount,
          'XAF' as currency,
          payment_status as status,
          CONCAT('Forum 2026: ', category) as description,
          id as reference,
          registered_at as createdAt
        FROM forum_registrations
        ORDER BY registered_at DESC
      `;
    console.log("Forum Payments:", forumPayments);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
