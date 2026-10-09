import { db, notifications, eq, and, isNull, sql } from '@workspace/db';
import { desc } from 'drizzle-orm';

async function testOptions() {
  const [row] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, 'fa0289e6-0109-4228-9f3d-f54b7164773c'), isNull(notifications.readAt)))
    .orderBy(desc(notifications.createdAt))
    .limit(1);

  const [res1] = await db
    .select({
      latestDate: sql<any>`(array_agg(to_json(${notifications.createdAt}) order by ${notifications.createdAt} desc))[1]`,
      latestIso: sql<any>`(array_agg(to_char(${notifications.createdAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') order by ${notifications.createdAt} desc))[1]`,
      latestTextZ: sql<any>`(array_agg(${notifications.createdAt}::text || 'Z' order by ${notifications.createdAt} desc))[1]`,
    })
    .from(notifications)
    .where(and(eq(notifications.userId, 'fa0289e6-0109-4228-9f3d-f54b7164773c'), isNull(notifications.readAt)));

  console.log('Original row.createdAt.toISOString():', row.createdAt.toISOString());
  console.log('Option 1 (to_json):                  ', res1.latestDate);
  console.log('Option 2 (to_char at UTC):           ', res1.latestIso);
  console.log('Option 3 (append Z and parse Date):  ', res1.latestTextZ ? new Date(res1.latestTextZ.replace(' ', 'T')).toISOString() : 'N/A');

  process.exit(0);
}

testOptions().catch(console.error);
