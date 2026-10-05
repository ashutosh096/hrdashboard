import { db, sql, announcements, announcementReads, users } from '@workspace/db';

async function runMigration() {
  console.log('--- Starting Announcements & Notifications Migration ---');

  try {
    // 1. Create announcement_reads table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at timestamp NOT NULL DEFAULT now()
      );
    `);
    console.log('✅ announcement_reads table verified/created.');

    // 2. Create unique index on (announcement_id, user_id)
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS announcement_reads_ann_user_unique 
      ON announcement_reads(announcement_id, user_id);
    `);
    console.log('✅ Unique index announcement_reads_ann_user_unique verified/created.');

    // 3. Create composite index on notifications(user_id, read_at, created_at)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS notifications_user_read_created_idx 
      ON notifications(user_id, read_at, created_at DESC);
    `);
    console.log('✅ Composite index notifications_user_read_created_idx verified/created.');

    // 4. Backfill existing seenBy array into announcement_reads
    const allAnnouncements = await db.select().from(announcements);
    const allUsers = await db.select().from(users);

    const userMap = new Map<string, string>(); // identifier lower -> user.id
    for (const u of allUsers) {
      userMap.set(u.id.toLowerCase(), u.id);
      if (u.email) userMap.set(u.email.toLowerCase(), u.id);
      if (u.employeeId) userMap.set(u.employeeId.toLowerCase(), u.id);
    }

    let backfilledCount = 0;
    for (const ann of allAnnouncements) {
      let rawSeen: any[] = [];
      if (Array.isArray(ann.seenBy)) {
        rawSeen = ann.seenBy;
      } else if (typeof ann.seenBy === 'string') {
        try { rawSeen = JSON.parse(ann.seenBy); } catch {}
      }

      for (const item of rawSeen) {
        const str = String(item).toLowerCase().trim();
        const matchedUserId = userMap.get(str);
        if (matchedUserId) {
          try {
            await db.execute(sql`
              INSERT INTO announcement_reads (announcement_id, user_id, read_at)
              VALUES (${ann.id}, ${matchedUserId}, now())
              ON CONFLICT (announcement_id, user_id) DO NOTHING;
            `);
            backfilledCount++;
          } catch {}
        }
      }
    }
    console.log(`✅ Backfilled ${backfilledCount} legacy announcement read entries into announcement_reads.`);

    // 5. Clean up old read notifications older than 60 days
    const cleanupResult = await db.execute(sql`
      DELETE FROM notifications 
      WHERE read_at IS NOT NULL AND created_at < NOW() - INTERVAL '60 days';
    `);
    console.log('✅ Cleaned up old read notifications > 60 days.');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
