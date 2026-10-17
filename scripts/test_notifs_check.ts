import { db, projects, epics, notifications, eq, desc } from '@workspace/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'hros_jwt_super_secret_key_2026';

function createToken(payload: { id: string; email: string; role: string; employeeId?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

async function testNotifs() {
  const tokenHarshit = createToken({
    id: 'fa0289e6-0109-4228-9f3d-f54b7164773c',
    email: 'harshit@ehmconsultancy.co.in',
    role: 'ADMIN',
    employeeId: '1e32f27a-d641-40ff-923c-05fef4836c10',
  });

  const tokenUtsav = createToken({
    id: '2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3',
    email: 'utsav@ehmconsultancy.co.in',
    role: 'ADMIN',
    employeeId: 'a9918b75-cba5-46e9-8bee-e9c536a331cc',
  });

  // 1. PROJECT UPDATE:
  // PROJ0015 (StartinUP MKT Grant) led by Neha Shukla (userId: 598469a9-7dd2-4ff6-8cfd-f3320ea94f46)
  const [proj] = await db.select().from(projects).where(eq(projects.code, 'PROJ0015'));
  const oldProjStatus = proj.status;
  const newProjStatus = oldProjStatus === 'Active' ? 'In Review' : 'Active';

  console.log(`[PROJECT TEST] Updating PROJ0015 status from '${oldProjStatus}' to '${newProjStatus}' by Harshit Mishra...`);
  const projRes = await fetch('http://localhost:5005/api/projects/' + proj.id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tokenHarshit },
    body: JSON.stringify({ status: newProjStatus }),
  });
  console.log('[PROJECT TEST] PATCH status:', projRes.status);

  await new Promise(r => setTimeout(r, 1500));

  const projNotifs = await db.select().from(notifications)
    .where(eq(notifications.type, 'PROJECT_STATUS_CHANGED'))
    .orderBy(desc(notifications.createdAt))
    .limit(5);

  const matchedProjNotifs = projNotifs.filter(n => (n.payload as any)?.entityId === proj.id);
  console.log('\n=== PROJECT UPDATE NOTIFICATION ROWS (Expected: Only Lead Neha Shukla receives notification) ===');
  console.table(matchedProjNotifs.map(n => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: (n.payload as any)?.title,
    message: (n.payload as any)?.message,
    createdAt: n.createdAt,
  })));

  // 2. EPIC UPDATE:
  // EPIC0011 (ClimIntellio demo) assigned to Harshit Mishra (userId: fa0289e6-0109-4228-9f3d-f54b7164773c)
  const [epic] = await db.select().from(epics).where(eq(epics.epicCode, 'EPIC0011'));
  const oldEpicStatus = epic.status;
  const newEpicStatus = oldEpicStatus === 'IN_PROGRESS' ? 'PLANNING' : 'IN_PROGRESS';

  console.log(`\n[EPIC TEST] Updating EPIC0011 status from '${oldEpicStatus}' to '${newEpicStatus}' by Utsav Mishra...`);
  const epicRes = await fetch('http://localhost:5005/api/epics/' + epic.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tokenUtsav },
    body: JSON.stringify({ status: newEpicStatus }),
  });
  console.log('[EPIC TEST] PUT status:', epicRes.status);

  await new Promise(r => setTimeout(r, 1500));

  const epicNotifs = await db.select().from(notifications)
    .where(eq(notifications.type, 'EPIC_STATUS_CHANGED'))
    .orderBy(desc(notifications.createdAt))
    .limit(5);

  const matchedEpicNotifs = epicNotifs.filter(n => (n.payload as any)?.entityId === epic.id);
  console.log('\n=== EPIC UPDATE NOTIFICATION ROWS (Expected: Only Assignee Harshit Mishra receives notification) ===');
  console.table(matchedEpicNotifs.map(n => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: (n.payload as any)?.title,
    message: (n.payload as any)?.message,
    createdAt: n.createdAt,
  })));

  // 3. CLEAN UP TEST DATA
  console.log('\nCleaning up test updates and notifications...');
  await db.update(projects).set({ status: oldProjStatus }).where(eq(projects.id, proj.id));
  await db.update(epics).set({ status: oldEpicStatus }).where(eq(epics.id, epic.id));
  for (const pn of matchedProjNotifs) await db.delete(notifications).where(eq(notifications.id, pn.id));
  for (const en of matchedEpicNotifs) await db.delete(notifications).where(eq(notifications.id, en.id));
  console.log('Clean up completed successfully.');
}

testNotifs().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
