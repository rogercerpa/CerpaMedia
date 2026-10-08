import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const JWT_TOKEN = process.env.JWT_TOKEN;
const SESSION_ID = process.env.SESSION_ID;
const EMAIL = 'cerpamedia@gmail.com';

async function main() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/cms_test_pr34',
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await prisma.adminSession.create({
    data: {
      id: SESSION_ID,
      email: EMAIL,
      token: JWT_TOKEN,
      expiresAt,
    },
  });
  
  console.log('✓ Inserted AdminSession');
  
  await prisma.$disconnect();
  await pool.end();
}

main();
