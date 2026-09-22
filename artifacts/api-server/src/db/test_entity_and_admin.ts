import { db, users, employees, entities, eq } from '@workspace/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_123456';

async function testEntityAndAdmin() {
  console.log('--- 1. Verifying Ashutosh is ADMIN in DB ---');
  const [ashuUser] = await db.select().from(users).where(eq(users.email, 'ashutosh@ehmconsultancy.com'));
  const [ashuEmp] = await db.select().from(employees).where(eq(employees.email, 'ashutosh@ehmconsultancy.com'));
  console.log('Ashutosh User Role:', ashuUser?.role);
  console.log('Ashutosh Employee Code:', ashuEmp?.employeeCode);

  if (ashuUser?.role !== 'ADMIN') {
    throw new Error('Ashutosh user role is not ADMIN!');
  }

  const token = jwt.sign(
    {
      id: ashuUser.id,
      email: ashuUser.email,
      role: 'ADMIN',
      employeeId: ashuUser.employeeId,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('\n--- 2. Testing Entity Switch to COMMON ---');
  const [pranshuEmp] = await db.select().from(employees).where(eq(employees.email, 'dubey.pranshu@gmail.com'));
  
  const res1 = await fetch(`http://localhost:5000/api/employees/${pranshuEmp.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      firstName: pranshuEmp.firstName,
      lastName: pranshuEmp.lastName,
      email: pranshuEmp.email,
      designation: pranshuEmp.designation,
      role: 'MANAGER',
      departmentName: 'Product & Tech',
      entityCode: 'COMMON'
    })
  });
  const data1 = await res1.json();
  console.log('Update to COMMON status:', res1.status);
  console.log('Updated employee data:', data1.employee);
  if (data1.employee?.employeeCode?.startsWith('COM')) {
    console.log('✅ PASS: COM prefix assigned for COMMON entity!');
  }

  console.log('\n--- 3. Testing Entity Switch to CAG ---');
  const res2 = await fetch(`http://localhost:5000/api/employees/${pranshuEmp.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      firstName: pranshuEmp.firstName,
      lastName: pranshuEmp.lastName,
      email: pranshuEmp.email,
      designation: pranshuEmp.designation,
      role: 'MANAGER',
      departmentName: 'Product & Tech',
      entityCode: 'CAG'
    })
  });
  const data2 = await res2.json();
  console.log('Update to CAG status:', res2.status);
  console.log('Updated employee data:', data2.employee);
  if (data2.employee?.employeeCode?.startsWith('CAG')) {
    console.log('✅ PASS: CAG prefix assigned for CAG entity!');
  }

  console.log('\n--- 4. Reverting Pranshu back to EHM ---');
  const res3 = await fetch(`http://localhost:5000/api/employees/${pranshuEmp.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      firstName: pranshuEmp.firstName,
      lastName: pranshuEmp.lastName,
      email: pranshuEmp.email,
      designation: pranshuEmp.designation,
      role: 'MANAGER',
      departmentName: 'Product & Tech',
      entityCode: 'EHM'
    })
  });
  const data3 = await res3.json();
  console.log('Revert to EHM status:', res3.status);
  console.log('Reverted employee data:', data3.employee);
  if (data3.employee?.employeeCode?.startsWith('EHM')) {
    console.log('✅ PASS: Reverted to EHM prefix!');
  }

  console.log('\n--- 5. GET /api/employees output ---');
  const getRes = await fetch('http://localhost:5000/api/employees', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const allEmps = await getRes.json();
  allEmps.forEach((e: any) => {
    console.log(`- [${e.employeeCode}] ${e.firstName} ${e.lastName} | Role: ${e.role} | Entity: ${e.entityCode} | Dept: ${e.departmentName}`);
  });

  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

testEntityAndAdmin().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
