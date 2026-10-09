import { db, sql } from '@workspace/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'hros_jwt_super_secret_key_2026';

async function checkTimestamps() {
  // 1. Get raw DB row for the latest unread notification
  const rawRes: any = await db.execute(sql`
    SELECT id, user_id, created_at, created_at::text as text_created_at 
    FROM notifications 
    WHERE read_at IS NULL 
    ORDER BY created_at DESC 
    LIMIT 1;
  `);

  const rawRow = rawRes.rows[0];
  if (!rawRow) {
    console.log('No unread notifications found in DB to test.');
    process.exit(0);
  }

  const notifId = rawRow.id;
  const userId = rawRow.user_id;
  const rawCreatedAt = rawRow.created_at;
  const rawTextCreatedAt = rawRow.text_created_at;

  // Generate token for this user
  const token = jwt.sign({ id: userId, email: 'test@example.com', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });

  // 2. Query GET /api/notifications
  const listRes = await fetch('http://localhost:5005/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData: any = await listRes.json();
  const matchedFromList = listData.find((n: any) => n.id === notifId);

  // 3. Query GET /api/notifications/unread-summary
  const summaryRes = await fetch('http://localhost:5005/api/notifications/unread-summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const summaryData: any = await summaryRes.json();

  console.log('=== TIMESTAMP VERIFICATION ===');
  console.log('Notification ID:               ', notifId);
  console.log('1. Raw DB created_at (Date):   ', rawCreatedAt instanceof Date ? rawCreatedAt.toISOString() : rawCreatedAt);
  console.log('   Raw DB text_created_at:     ', rawTextCreatedAt);
  console.log('2. GET /api/notifications:     ', matchedFromList?.createdAt);
  console.log('3. GET /unread-summary:        ', summaryData?.latestUnreadCreatedAt);
  console.log('Exact Match (List vs Summary): ', matchedFromList?.createdAt === summaryData?.latestUnreadCreatedAt);
  console.log('Exact Match (DB vs Summary):   ', (rawCreatedAt instanceof Date ? rawCreatedAt.toISOString() : rawCreatedAt) === summaryData?.latestUnreadCreatedAt);
  process.exit(0);
}

checkTimestamps().catch(err => {
  console.error(err);
  process.exit(1);
});
