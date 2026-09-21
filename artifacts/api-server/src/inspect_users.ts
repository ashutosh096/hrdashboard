import { db, users, employees, invites } from '@workspace/db';

async function inspect() {
  const u = await db.select().from(users);
  console.log('=== USERS TABLE ===');
  u.forEach(x => console.log(`ID: ${x.id} | Email: ${x.email} | Role: ${x.role} | EmpId: ${x.employeeId}`));

  const e = await db.select().from(employees);
  console.log('\n=== EMPLOYEES TABLE ===');
  e.forEach(x => console.log(`ID: ${x.id} | Code: ${x.employeeCode} | Name: ${x.firstName} ${x.lastName} | Email: ${x.email}`));

  const inv = await db.select().from(invites);
  console.log('\n=== INVITES TABLE ===');
  inv.forEach(x => console.log(`Email: ${x.email} | Role: ${x.role} | EmpId: ${x.employeeId}`));
}

inspect().catch(console.error).finally(() => process.exit(0));
