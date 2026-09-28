import { db, users, employees } from '@workspace/db';
import { eq } from 'drizzle-orm';

console.error('DEPRECATED: audit_users.ts writes old-format codes and is disabled under Step 2.');
process.exit(1);

async function fixAndAudit() {
  // Update Ashutosh Mishra code to EHM-ADM01 and role to ADMIN
  await db.update(employees).set({
    employeeCode: 'EHM-ADM01',
    designation: 'Managing Director & Founder',
  }).where(eq(employees.email, 'ashutosh@ehmconsultancy.com'));

  await db.update(users).set({
    role: 'ADMIN',
    status: 'ACTIVE',
  }).where(eq(users.email, 'ashutosh@ehmconsultancy.com'));

  const allUsers = await db.select().from(users);
  console.log('ALL USERS IN DB:');
  for (const u of allUsers) {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, EmployeeId: ${u.employeeId}`);
  }

  const allEmployees = await db.select().from(employees);
  console.log('\nALL EMPLOYEES IN DB:');
  for (const e of allEmployees) {
    console.log(`- ID: ${e.id}, Code: ${e.employeeCode}, Name: ${e.firstName} ${e.lastName}, Email: ${e.email}`);
  }
}

fixAndAudit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
