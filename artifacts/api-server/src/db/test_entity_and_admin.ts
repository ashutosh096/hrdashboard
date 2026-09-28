import { db, users, employees, employeeCodeHistory, entities, globalCounters, eq } from '@workspace/db';
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
  if (!/^ADMN\d{4}$/.test(ashuEmp?.employeeCode || '')) {
    throw new Error(`Expected Ashutosh employee code to match ^ADMN\\d{4}$, got: ${ashuEmp?.employeeCode}`);
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

  let testEmpId: string | null = null;
  let testUserId: string | null = null;

  try {
    console.log('\n--- 2. Testing Entity Switch without role change (code remains unchanged) ---');
    const [cagEntity] = await db.select().from(entities).where(eq(entities.code, 'CAG'));
    const [ehmEntity] = await db.select().from(entities).where(eq(entities.code, 'EHM'));

    // Create a temporary employee for safe testing
    const testEmail = `test.entityadmin.${Date.now()}@example.com`;
    const createRes = await fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Entity',
        lastName: 'Tester',
        email: testEmail,
        designation: 'Specialist',
        role: 'EMPLOYEE',
        entityId: ehmEntity.id,
      })
    });
    const createData = await createRes.json();
    const testEmp = createData.employee;
    testEmpId = testEmp.id;
    const initialCode = testEmp.employeeCode;

    if (!/^TEAM\d{4}$/.test(initialCode)) {
      throw new Error(`Expected initial code to match ^TEAM\\d{4}$, got: ${initialCode}`);
    }

    // Switch to CAG (role unchanged)
    const res1 = await fetch(`http://localhost:5000/api/employees/${testEmpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Entity',
        lastName: 'Tester',
        email: testEmail,
        designation: 'Specialist',
        role: 'EMPLOYEE',
        entityCode: 'CAG'
      })
    });
    const data1 = await res1.json();
    console.log('Update to CAG status:', res1.status);
    if (data1.employee?.entityCode === 'CAG' && data1.employee?.employeeCode === initialCode && /^TEAM\d{4}$/.test(data1.employee?.employeeCode)) {
      console.log('✅ PASS: CAG entity assigned while employeeCode preserved and matches ^TEAM\\d{4}!');
    } else {
      throw new Error(`Expected employeeCode to remain ${initialCode}, got: ${data1.employee?.employeeCode}`);
    }

    // Switch to COMMON (role unchanged)
    const res2 = await fetch(`http://localhost:5000/api/employees/${testEmpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Entity',
        lastName: 'Tester',
        email: testEmail,
        designation: 'Specialist',
        role: 'EMPLOYEE',
        entityCode: 'COMMON'
      })
    });
    const data2 = await res2.json();
    console.log('Update to COMMON status:', res2.status);
    if (data2.employee?.entityCode === 'COMMON' && data2.employee?.employeeCode === initialCode) {
      console.log('✅ PASS: COMMON entity assigned while employeeCode preserved!');
    } else {
      throw new Error(`Expected employeeCode to remain ${initialCode}, got: ${data2.employee?.employeeCode}`);
    }

    console.log('\n--- 3. Testing Role change -> prefix changes, counter increments, history row inserted ---');
    const [counterBefore] = await db.select().from(globalCounters).where(eq(globalCounters.id, 1));
    const expectedManaCode = `MANA${String(counterBefore.nextManaSeq).padStart(4, '0')}`;

    const roleChangeRes = await fetch(`http://localhost:5000/api/employees/${testEmpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        role: 'MANAGER',
      })
    });
    const roleChangeData = await roleChangeRes.json();
    const newCode = roleChangeData.employee?.employeeCode;

    if (newCode !== expectedManaCode) {
      throw new Error(`Expected new code ${expectedManaCode}, got: ${newCode}`);
    }

    const [hist] = await db.select().from(employeeCodeHistory).where(eq(employeeCodeHistory.employeeId, testEmpId!));
    if (!hist || hist.oldCode !== initialCode || hist.newCode !== newCode || hist.newRole !== 'MANAGER') {
      throw new Error(`History verification failed for employee ${testEmpId}: ${JSON.stringify(hist)}`);
    }
    console.log('✅ PASS: Role change updated code prefix to MANA and wrote employee_code_history!');

    console.log('\n--- 4. Testing Manual Code Edit (access unchanged) ---');
    await db.update(employees).set({ employeeCode: 'MANA7777' }).where(eq(employees.id, testEmpId!));
    const [userRow] = await db.select().from(users).where(eq(users.email, testEmail));
    if (userRow) {
      testUserId = userRow.id;
      const testToken = jwt.sign(
        { id: userRow.id, email: userRow.email, role: userRow.role, employeeId: testEmpId },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const testReq = await fetch('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      if (testReq.status !== 200) {
        throw new Error(`Expected status 200 with manually edited employee_code, got: ${testReq.status}`);
      }
      console.log('✅ PASS: Access is unchanged after manual employee_code edit (permissions come from users.role)!');
    }

    console.log('\n--- 5. GET /api/employees output & prefix check ---');
    const getRes = await fetch('http://localhost:5000/api/employees', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const allEmps = await getRes.json();
    allEmps.forEach((e: any) => {
      console.log(`- [${e.employeeCode}] ${e.firstName} ${e.lastName} | Role: ${e.role} | Entity: ${e.entityCode} | Dept: ${e.departmentName}`);
      if (!/^(ADMN|MANA|TEAM)\d{4}$/.test(e.employeeCode)) {
        throw new Error(`Employee ${e.firstName} code ${e.employeeCode} does not match ^(ADMN|MANA|TEAM)\\d{4}$`);
      }
      const expectedPrefix = e.role === 'ADMIN' ? 'ADMN' : e.role === 'MANAGER' ? 'MANA' : 'TEAM';
      if (!e.employeeCode.startsWith(expectedPrefix)) {
        throw new Error(`Employee ${e.firstName} prefix mismatch: expected ${expectedPrefix}, got ${e.employeeCode}`);
      }
    });

  } finally {
    if (testEmpId) {
      await db.delete(employeeCodeHistory).where(eq(employeeCodeHistory.employeeId, testEmpId));
      await db.delete(employees).where(eq(employees.id, testEmpId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    console.log('Cleaned up test data in finally block.');
  }

  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

testEntityAndAdmin().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
