import { db, entities, users, employees, invites, eq } from '@workspace/db';

async function checkAndSetAdmin() {
  console.log('--- Entities in DB ---');
  const allEntities = await db.select().from(entities);
  console.log(allEntities);

  console.log('\n--- Ensure Ashutosh is ADMIN ---');
  const [ashuUser] = await db.select().from(users).where(eq(users.email, 'ashutosh@ehmconsultancy.com'));
  console.log('Ashutosh User:', ashuUser);

  if (ashuUser) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, ashuUser.id));
    console.log('Updated user role to ADMIN');
  }

  const [ashuEmp] = await db.select().from(employees).where(eq(employees.email, 'ashutosh@ehmconsultancy.com'));
  console.log('Ashutosh Employee:', ashuEmp);

  await db.update(invites).set({ role: 'ADMIN' }).where(eq(invites.email, 'ashutosh@ehmconsultancy.com'));

  console.log('\n--- All users ---');
  const allUsers = await db.select({ id: users.id, email: users.email, role: users.role, employeeId: users.employeeId }).from(users);
  console.log(allUsers);

  process.exit(0);
}

checkAndSetAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
