import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const USER_X_ID = '6df0b051-0183-414d-96df-b32a19a24cf2';
const USER_X_EMP_ID = 'e6efb986-4f3d-40ac-bfe7-120fbd9d022d';

const tokenUserX = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZkZjBiMDUxLTAxODMtNDE0ZC05NmRmLWIzMmExOWEyNGNmMiIsImVtYWlsIjoiYXNodXRvc2htaXNocmF1cDc4QG1wZ2kuZWR1LmluIiwicm9sZSI6IkVNUExPWUVFIiwiZW1wbG95ZWVJZCI6ImU2ZWZiOTg2LTRmM2QtNDBhYy1iZmU3LTEyMGZiZDlkMDIyZCIsImlhdCI6MTc5MTU2NDM3MCwiZXhwIjoxNzk0MTU2MzcwfQ.5mtZlSDY2XIO2HvjV4yxZhdCKZUhtNaM438Kp2qEqE0';
const tokenAdmin = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZhMDI4OWU2LTAxMDktNDIyOC05ZjNkLWY1NGI3MTY0NzczYyIsImVtYWlsIjoiaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbiIsInJvbGUiOiJBRE1JTiIsImVtcGxveWVlSWQiOiIxZTMyZjI3YS1kNjQxLTQwZmYtOTIzYy0wNWZlZjQ4MzZjMTAiLCJpYXQiOjE3OTE1NjQzNzAsImV4cCI6MTc5NDE1NjM3MH0.6b-KS_dT43UTsup82q5Rhz0-QhLgoBdy5p0yBwDBxbE';

const createdTaskIds: string[] = [];

function runDbHelper(action: string, arg1: string = '', arg2: string = ''): string {
  const tsxPath = path.resolve('c:/hrdashboard/artifacts/api-server/node_modules/.bin/tsx.cmd');
  const helperPath = path.resolve('c:/hrdashboard/scripts/e2e_db_helper.ts');
  const cmd = `"${tsxPath}" "${helperPath}" ${action} "${arg1}" "${arg2}"`;
  return execSync(cmd, {
    cwd: 'c:/hrdashboard/artifacts/api-server',
    encoding: 'utf-8',
  });
}

test.describe.serial('Phase 2: App-wide Loading Elimination, User Isolation & Optimistic Rollback', () => {

  test.afterAll(async () => {
    console.log('\n=== SCOPED CLEANUP OF TEST ARTIFACTS ===');
    if (createdTaskIds.length > 0) {
      try {
        console.log(`Cleaning up task IDs: ${createdTaskIds.join(',')}`);
        const res = runDbHelper('cleanup', createdTaskIds.join(','));
        console.log('Cleanup result:\n', res.trim());
      } catch (err: any) {
        console.error('Cleanup error:', err.stdout || err.message);
      }
    } else {
      console.log('No test tasks were created to clean up.');
    }
  });

  test('Test 1: Revisit test covering 11 views showing ZERO loading text and ZERO spinners', async ({ page }) => {
    console.log('\n--- EXTENDED REVISIT TEST (11 VIEWS) ---');
    // Login as Admin
    await page.goto('http://localhost:5175/login');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
    }, { token: tokenAdmin });

    const views = [
      { name: 'Dashboard', path: '/', action: async () => {} },
      { name: 'Initiatives', path: '/tasks', action: async () => {
        const btn = page.getByRole('button', { name: /1\.\s*Initiatives/i });
        if (await btn.count() > 0) await btn.first().click();
      }},
      { name: 'Epics', path: '/tasks', action: async () => {
        const btn = page.getByRole('button', { name: /2\.\s*Epics/i });
        if (await btn.count() > 0) await btn.first().click();
      }},
      { name: 'Sprints', path: '/sprints', action: async () => {} },
      { name: 'Backlog', path: '/tasks', action: async () => {
        const btn = page.getByRole('button', { name: /3\.\s*Tasks/i });
        if (await btn.count() > 0) await btn.first().click();
      }},
      { name: 'Projects', path: '/projects', action: async () => {} },
      { name: 'Team Directory', path: '/team', action: async () => {} },
      { name: 'Attendance', path: '/attendance', action: async () => {} },
      { name: 'Meetings', path: '/meetings', action: async () => {} },
      { name: 'Announcements', path: '/announcements', action: async () => {} },
      { name: 'Performance', path: '/performance', action: async () => {} },
    ];

    const navigateTo = async (path: string) => {
      await page.evaluate((targetPath) => {
        window.history.pushState({}, '', targetPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, path);
    };

    console.log('\n[Phase 2 - Step 1]: Warming initial cache for all 11 views...');
    for (const view of views) {
      await page.goto(`http://localhost:5175${view.path}`);
      await page.waitForLoadState('networkidle');
      await view.action();
      await page.waitForTimeout(200);
      console.log(`  ✓ Warmed cache for ${view.name}`);
    }

    console.log('\n[Phase 2 - Step 2]: Testing second visit for each of 11 views (Asserting 0 spinners and 0 loading text)...');
    for (const view of views) {
      await navigateTo(view.path);
      await view.action();
      await page.waitForTimeout(300);

      const spinnerCount = await page.locator('.animate-spin').count();
      const loadingCount = await page.getByText(/Loading\.\.\.|Loading .* from database|Loading activity\.\.\.|Loading timeline\.\.\./i).count();

      console.log(`  ✓ ${view.name.padEnd(16)}: Spinners = ${spinnerCount}, Loading text = ${loadingCount}`);
      expect(spinnerCount).toBe(0);
      expect(loadingCount).toBe(0);
    }

    console.log('\nTEST 1 PASSED: All 11 pages rendered instantly on second visit with zero spinners and zero loading text.');
  });

  test('Test 4: User Session Isolation (Task list, Notifications, Dashboard data)', async ({ page }) => {
    console.log('\n--- TEST 4: User Session Isolation ---');
    // 1. Create a task assigned to User A (Admin)
    const adminTaskTitle = `E2E-TEST-ADMIN-${Date.now()}`;
    const createRes = await fetch('http://localhost:5005/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        title: adminTaskTitle,
        assigneeId: '1e32f27a-d641-40ff-923c-05fef4836c10', // Admin employee ID
        priority: 'HIGH',
        status: 'TODO',
        entityCode: 'EHM',
      }),
    });
    const createdTask = await createRes.json();
    if (createdTask?.id) createdTaskIds.push(createdTask.id);
    console.log(`Created private admin task: "${adminTaskTitle}" (ID: ${createdTask.id})`);

    // 2. Login User A (Admin)
    await page.goto('http://localhost:5175/login');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
    }, { token: tokenAdmin });

    // Verify Admin sees the task in Backlog
    await page.goto('http://localhost:5175/tasks');
    await page.waitForLoadState('networkidle');
    const tasksTabBtn = page.getByRole('button', { name: /3\.\s*Tasks/i });
    if (await tasksTabBtn.count() > 0) await tasksTabBtn.first().click();
    await page.waitForTimeout(300);

    const adminTaskVisibleForAdmin = await page.getByText(adminTaskTitle).count();
    console.log(`Admin sees admin task in task list: ${adminTaskVisibleForAdmin > 0 ? 'YES' : 'NO'}`);
    expect(adminTaskVisibleForAdmin).toBeGreaterThan(0);

    // 3. Admin visits Notifications
    await page.goto('http://localhost:5175/notifications');
    await page.waitForLoadState('networkidle');
    const adminNotifCount = await page.locator('div, li, tr').filter({ hasText: /notification|deliverable|meeting/i }).count();
    console.log(`Admin notifications view loaded with items count: ${adminNotifCount}`);

    // 4. Admin visits Dashboard
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    const adminEmailOnDash = await page.getByText('harshit@ehmconsultancy.co.in').count();
    console.log(`Admin dashboard rendered for User A: ${adminEmailOnDash > 0 ? 'YES' : 'NO'}`);
    expect(adminEmailOnDash).toBeGreaterThan(0);

    // 5. Logout User A
    console.log('Logging out User A and clearing all client storage...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5175/login');
    await page.waitForLoadState('networkidle');

    // 6. Login as User B (Employee User X)
    console.log('Logging in as User B (Employee User X)...');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
    }, { token: tokenUserX });

    // 7. Verify User B task list does NOT contain User A's task
    await page.goto('http://localhost:5175/tasks');
    await page.waitForLoadState('networkidle');
    const adminTaskVisibleForUserB = await page.getByText(adminTaskTitle).count();
    console.log(`User B sees User A's task in task list: ${adminTaskVisibleForUserB > 0 ? 'LEAKED' : 'NOT VISIBLE (ISOLATED)'}`);
    expect(adminTaskVisibleForUserB).toBe(0);

    // 8. Verify User B does NOT see User A's notifications
    await page.goto('http://localhost:5175/notifications');
    await page.waitForLoadState('networkidle');
    const leakedNotifForUserB = await page.getByText(adminTaskTitle).count();
    console.log(`User B sees User A's task notification: ${leakedNotifForUserB > 0 ? 'LEAKED' : 'NOT VISIBLE (ISOLATED)'}`);
    expect(leakedNotifForUserB).toBe(0);

    // 9. Verify User B dashboard reflects Employee scoped data
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    const leakedAdminEmail = await page.getByText('harshit@ehmconsultancy.co.in').count();
    console.log(`User B dashboard leaks Admin email: ${leakedAdminEmail > 0 ? 'LEAKED' : 'NO (ISOLATED)'}`);
    expect(leakedAdminEmail).toBe(0);
    const userBEmail = await page.getByText('ashutoshmishraup78@mpgi.edu.in').count();
    console.log(`User B sees User B email on personal dashboard: ${userBEmail > 0 ? 'YES' : 'NO'}`);
    expect(userBEmail).toBeGreaterThan(0);

    console.log('TEST 4 PASSED: User A task list, notifications, and dashboard data are completely invisible to User B.');
  });

  test('Test 5: Optimistic update with UI rollback on failed save and error toast', async ({ page }) => {
    console.log('\n--- TEST 5: Optimistic UI Update & Rollback on Save Failure ---');
    // 1. Create a test task for status rollback testing
    const rollbackTaskTitle = `E2E-TEST-ROLLBACK-${Date.now()}`;
    const createRes = await fetch('http://localhost:5005/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        title: rollbackTaskTitle,
        assigneeId: '1e32f27a-d641-40ff-923c-05fef4836c10',
        priority: 'P2',
        status: 'TODO',
        entityCode: 'EHM',
      }),
    });
    const createdTask = await createRes.json();
    if (createdTask?.id) createdTaskIds.push(createdTask.id);
    console.log(`Created task for rollback test: "${rollbackTaskTitle}" (Initial status: TODO)`);

    // 2. Login as Admin
    await page.goto('http://localhost:5175/login');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
    }, { token: tokenAdmin });

    // 3. Navigate to Tasks view and switch to 3. Tasks
    await page.goto('http://localhost:5175/tasks');
    await page.waitForLoadState('networkidle');
    const tasksTabBtn = page.getByRole('button', { name: /3\.\s*Tasks/i });
    if (await tasksTabBtn.count() > 0) await tasksTabBtn.first().click();
    await page.waitForTimeout(300);

    // 4. Intercept PATCH/PUT requests to /api/tasks/* to simulate a server failure (500)
    await page.route(`**/api/tasks/${createdTask.id}`, (route) => {
      console.log(`[NETWORK INTERCEPT] Simulating 500 server error on save for task ${createdTask.id}`);
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Database write failure simulation' }),
      });
    });

    // 5. Locate the task row and open the task update modal
    const taskRow = page.locator(`tr:has-text("${rollbackTaskTitle}")`);
    await expect(taskRow).toBeVisible({ timeout: 5000 });

    const statusDropdown = taskRow.locator('select').first();
    const originalStatus = await statusDropdown.inputValue();
    console.log(`Original status in UI: ${originalStatus}`);

    // 6. Trigger status change in UI
    console.log('Changing status to IN_PROGRESS via UI dropdown...');
    await statusDropdown.selectOption('IN_PROGRESS');

    // 7. Verify error toast is displayed
    const errorToast = page.getByText(/Database write failure simulation|Failed to update task status/i);
    await expect(errorToast).toBeVisible({ timeout: 5000 });
    console.log('✓ Error toast successfully displayed to user!');

    // 8. Verify UI rolls back to original status
    await page.waitForTimeout(300);
    const rolledBackStatus = await statusDropdown.inputValue();
    console.log(`Status in UI after rollback: ${rolledBackStatus}`);
    expect(rolledBackStatus).toBe(originalStatus);

    // 9. Unroute network interception
    await page.unroute(`**/api/tasks/${createdTask.id}`);
    console.log('TEST 5 PASSED: Failed save successfully reverted the UI to previous status and displayed error toast.');
  });
});
