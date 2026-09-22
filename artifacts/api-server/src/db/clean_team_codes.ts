import { db, users, employees, departments, entities, eq, and } from '@workspace/db';

async function cleanTeam() {
  console.log('--- Cleaning Core Team Employee Codes & Entities ---');

  const [ehmEntity] = await db.select().from(entities).where(eq(entities.code, 'EHM'));
  const [cagEntity] = await db.select().from(entities).where(eq(entities.code, 'CAG'));
  const [techDept] = await db.select().from(departments).where(and(eq(departments.entityId, ehmEntity.id), eq(departments.name, 'Product & Tech')));
  const [cagTechDept] = await db.select().from(departments).where(and(eq(departments.entityId, cagEntity.id), eq(departments.name, 'Product & Tech')));

  // Ashutosh: EHM, Product & Tech, ADMIN, EHM-ADM01
  await db.update(employees).set({
    employeeCode: 'EHM-ADM01',
    entityId: ehmEntity.id,
    departmentId: techDept?.id || undefined,
    designation: 'System Administrator & VP Tech'
  }).where(eq(employees.email, 'ashutosh@ehmconsultancy.com'));

  // Pranshu: EHM, Product & Tech, MANAGER, EHM-MGR01
  await db.update(employees).set({
    employeeCode: 'EHM-MGR01',
    entityId: ehmEntity.id,
    departmentId: techDept?.id || undefined,
    designation: 'Engineering Lead'
  }).where(eq(employees.email, 'dubey.pranshu@gmail.com'));

  // Harshit: EHM, Product & Tech, MANAGER, EHM-MGR02
  await db.update(employees).set({
    employeeCode: 'EHM-MGR02',
    entityId: ehmEntity.id,
    departmentId: techDept?.id || undefined,
    designation: 'Lead Engineer'
  }).where(eq(employees.email, 'harshit@ehmconsultancy.com'));

  // Utsav: EHM, Product & Tech, MANAGER, EHM-MGR03
  await db.update(employees).set({
    employeeCode: 'EHM-MGR03',
    entityId: ehmEntity.id,
    departmentId: techDept?.id || undefined,
    designation: 'Technical Architect'
  }).where(eq(employees.email, 'utsav@ehmconsultancy.co.in'));

  // Eustace: CAG, Product & Tech, MANAGER/EMPLOYEE, CAG-EMP01
  await db.update(employees).set({
    employeeCode: 'CAG-EMP01',
    entityId: cagEntity.id,
    departmentId: cagTechDept?.id || undefined,
    designation: 'Operations Lead'
  }).where(eq(employees.email, 'eustace@climagro.com'));

  const emps = await db.select().from(employees);
  console.log('Cleaned employees:');
  emps.forEach(e => console.log(`[${e.employeeCode}] ${e.firstName} ${e.lastName} (${e.email})`));
  process.exit(0);
}

cleanTeam().catch(err => {
  console.error(err);
  process.exit(1);
});
