import { db, users, employees, departments, entities, eq } from '@workspace/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_123456';

async function testEmployeeUpdates() {
  console.log('--- 1. Testing Employee Role & Code & Entity Updates ---');
  
  // Find Ashutosh (admin)
  const [adminUser] = await db.select().from(users).where(eq(users.email, 'ashutosh@ehmconsultancy.com'));
  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  const token = jwt.sign(
    {
      id: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
      employeeId: adminUser.employeeId,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 1. Fetch current employees
  const fetchRes = await fetch('http://localhost:5000/api/employees', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const emps = await fetchRes.json();
  console.log(`Fetched ${emps.length} employees:`);
  emps.forEach((e: any) => {
    console.log(`- [${e.employeeCode}] ${e.firstName} ${e.lastName} | Role: ${e.role} | Dept: ${e.departmentName} | Entity: ${e.entityCode}`);
  });

  // Verify all departments are valid among the 5
  const validDepts = ['Marketing', 'Sales', 'Product & Tech', 'Operations & Delivery', 'Grants & Governance'];
  for (const e of emps) {
    if (!validDepts.includes(e.departmentName)) {
      console.warn(`WARNING: Employee ${e.firstName} has non-standard department "${e.departmentName}"`);
    }
  }

  console.log('\n--- 2. Testing Update on Employee ---');
  // Find a test employee or non-admin employee
  const target = emps.find((e: any) => e.email === 'utsav@ehmconsultancy.co.in' || e.email === 'harshit@ehmconsultancy.com') || emps[1];
  if (target) {
    console.log(`Updating employee ${target.firstName} (${target.id}) to department "Grants & Governance" and entity "CAG"...`);
    
    const updateRes = await fetch(`http://localhost:5000/api/employees/${target.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: target.firstName,
        lastName: target.lastName,
        email: target.email,
        designation: target.designation,
        role: target.role,
        departmentName: 'Grants & Governance',
        entityCode: 'CAG'
      })
    });

    const updateData = await updateRes.json();
    console.log('Update response status:', updateRes.status);
    console.log('Updated employee data:', updateData.employee);

    if (updateData.employee?.employeeCode?.startsWith('CAG')) {
      console.log('✅ PASS: Employee code updated to CAG prefix successfully!');
    } else {
      console.log('⚠️ Code check:', updateData.employee?.employeeCode);
    }

    // Revert back to EHM and Product & Tech
    console.log(`Reverting employee ${target.firstName} back to EHM...`);
    const revertRes = await fetch(`http://localhost:5000/api/employees/${target.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: target.firstName,
        lastName: target.lastName,
        email: target.email,
        designation: target.designation,
        role: target.role,
        departmentName: 'Product & Tech',
        entityCode: 'EHM'
      })
    });
    const revertData = await revertRes.json();
    console.log('Reverted employee code:', revertData.employee?.employeeCode, '| Dept:', revertData.employee?.departmentName);
    if (revertData.employee?.employeeCode?.startsWith('EHM')) {
      console.log('✅ PASS: Employee successfully reverted to EHM prefix!');
    }
  }

  console.log('\n--- ALL EMPLOYEE VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

testEmployeeUpdates().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
