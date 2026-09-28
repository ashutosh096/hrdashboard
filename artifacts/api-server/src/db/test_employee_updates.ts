import { db, users, employees, employeeCodeHistory, departments, entities, globalCounters, eq, sql } from '@workspace/db';
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

  let testEmpId: string | null = null;
  let testUserId: string | null = null;

  try {
    // 1. Fetch current employees
    const fetchRes = await fetch('http://localhost:5000/api/employees', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const emps = await fetchRes.json();
    console.log(`Fetched ${emps.length} employees:`);
    emps.forEach((e: any) => {
      console.log(`- [${e.employeeCode}] ${e.firstName} ${e.lastName} | Role: ${e.role} | Dept: ${e.departmentName} | Entity: ${e.entityCode}`);
    });

    // Verify all employee codes match ^(ADMN|MANA|TEAM)\d{4}$ AND prefix matches users.role
    for (const e of emps) {
      if (!/^(ADMN|MANA|TEAM)\d{4}$/.test(e.employeeCode)) {
        throw new Error(`Expected employee code to match ^(ADMN|MANA|TEAM)\\d{4}$, got: ${e.employeeCode}`);
      }
      const expectedPrefix = e.role === 'ADMIN' ? 'ADMN' : e.role === 'MANAGER' ? 'MANA' : 'TEAM';
      if (!e.employeeCode.startsWith(expectedPrefix)) {
        throw new Error(`Expected employee code prefix ${expectedPrefix} to match role ${e.role}, got: ${e.employeeCode}`);
      }
    }

    console.log('\n--- 2. Testing Entity change (code remains unchanged) ---');
    // Create dedicated temporary test employee
    const [cagEntity] = await db.select().from(entities).where(eq(entities.code, 'CAG'));
    const [ehmEntity] = await db.select().from(entities).where(eq(entities.code, 'EHM'));
    const [dept] = await db.select().from(departments).limit(1);

    const testEmail = `test.rolechange.${Date.now()}@example.com`;
    const createRes = await fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'RoleChange',
        email: testEmail,
        designation: 'QA Specialist',
        role: 'EMPLOYEE',
        entityId: ehmEntity.id,
        departmentId: dept.id,
      })
    });
    const createdData = await createRes.json();
    const createdEmp = createdData.employee;
    testEmpId = createdEmp.id;

    if (!/^TEAM\d{4}$/.test(createdEmp.employeeCode)) {
      throw new Error(`Expected created employee to have TEAM#### code, got: ${createdEmp.employeeCode}`);
    }
    const initialCode = createdEmp.employeeCode;
    console.log('Created test employee with initial code:', initialCode);

    // Entity change only: code must NOT change
    const updateEntityRes = await fetch(`http://localhost:5000/api/employees/${testEmpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'RoleChange',
        email: testEmail,
        designation: 'Senior QA Specialist',
        role: 'EMPLOYEE',
        entityId: cagEntity.id,
        departmentName: 'Product & Tech',
      })
    });
    const updatedEntityData = await updateEntityRes.json();
    if (updatedEntityData.employee?.employeeCode !== initialCode) {
      throw new Error(`Expected employeeCode to remain ${initialCode} on entity change, got: ${updatedEntityData.employee?.employeeCode}`);
    }
    console.log('✅ PASS: Entity change left employee code unchanged!');

    console.log('\n--- 3. Testing Role change (role change -> prefix changes, counter incremented, history row created) ---');
    // Check next_mana_seq before role change
    const [counterBefore] = await db.select().from(globalCounters).where(eq(globalCounters.id, 1));
    const expectedManaNum = String(counterBefore.nextManaSeq).padStart(4, '0');
    const expectedNewCode = `MANA${expectedManaNum}`;

    const updateRoleRes = await fetch(`http://localhost:5000/api/employees/${testEmpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'RoleChange',
        email: testEmail,
        role: 'MANAGER',
      })
    });
    const updatedRoleData = await updateRoleRes.json();
    const newCode = updatedRoleData.employee?.employeeCode;
    console.log('New employee code after role change to MANAGER:', newCode);

    if (newCode !== expectedNewCode) {
      throw new Error(`Expected new code ${expectedNewCode}, got: ${newCode}`);
    }
    if (!/^MANA\d{4}$/.test(newCode)) {
      throw new Error(`Expected code to match ^MANA\\d{4}$, got: ${newCode}`);
    }

    // Verify employee_code_history row exists
    const [historyRow] = await db
      .select()
      .from(employeeCodeHistory)
      .where(eq(employeeCodeHistory.employeeId, testEmpId!));

    if (!historyRow) {
      throw new Error(`Expected row in employee_code_history for employee ${testEmpId}, found none!`);
    }
    if (historyRow.oldCode !== initialCode || historyRow.newCode !== newCode || historyRow.oldRole !== 'EMPLOYEE' || historyRow.newRole !== 'MANAGER') {
      throw new Error(`employee_code_history row mismatch: ${JSON.stringify(historyRow)}`);
    }
    console.log('✅ PASS: Role change generated new code from counter and recorded employee_code_history row!');

    console.log('\n--- 4. Testing Manual Code Edit (access is unchanged because role comes from users.role) ---');
    // Manually edit employee_code in DB to a custom string
    const customCode = 'MANA9999';
    await db.update(employees).set({ employeeCode: customCode }).where(eq(employees.id, testEmpId!));

    // Create user token for this test employee
    const [testUser] = await db.select().from(users).where(eq(users.email, testEmail));
    if (testUser) {
      testUserId = testUser.id;
      const testEmpToken = jwt.sign(
        {
          id: testUser.id,
          email: testUser.email,
          role: testUser.role, // role comes from users.role, not employee_code
          employeeId: testEmpId,
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Verify test employee can still access MANAGER-permitted endpoint
      const accessRes = await fetch('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${testEmpToken}` }
      });
      if (accessRes.status !== 200) {
        throw new Error(`Expected access 200 with manually edited code, got: ${accessRes.status}`);
      }
      console.log('✅ PASS: User permissions and access are completely independent of employee_code text!');
    }

  } finally {
    // Clean up test employee, user, history in finally block
    if (testEmpId) {
      await db.delete(employeeCodeHistory).where(eq(employeeCodeHistory.employeeId, testEmpId));
      await db.delete(employees).where(eq(employees.id, testEmpId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    console.log('Cleaned up test data in finally block.');
  }

  console.log('\n--- ALL EMPLOYEE VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
}

testEmployeeUpdates().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
