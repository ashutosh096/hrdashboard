import { db, users, invites, sql } from '@workspace/db';

async function clean() {
  await db.delete(users).where(sql`email LIKE '%@example.com'`);
  await db.delete(invites);
  console.log('Cleaned dummy example.com user and invite rows.');
}

clean().catch(console.error).finally(() => process.exit(0));
