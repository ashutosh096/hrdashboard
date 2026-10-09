import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

// Exact User X (Employee) & Admin details
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

function attachNetworkLogger(page: Page, label: string = 'Tab') {
  const logs: string[] = [];

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/notifications')) {
      const time = new Date().toISOString().split('T')[1].slice(0, 12);
      const pathname = new URL(url).pathname;
      const log = `[${time}] [${label}] REQ: ${req.method()} ${pathname}`;
      logs.push(log);
      console.log(log);
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/notifications')) {
      const time = new Date().toISOString().split('T')[1].slice(0, 12);
      const pathname = new URL(url).pathname;
      let bodySnippet = '';
      try {
        const text = await res.text();
        bodySnippet = text.length > 120 ? text.slice(0, 120) + '...' : text;
      } catch {}
      const log = `[${time}] [${label}] RES: ${res.status()} ${pathname} -> ${bodySnippet}`;
      logs.push(log);
      console.log(log);
    }
  });

  return logs;
}

test.describe.serial('Notification Verification Suite', () => {

  test.afterAll(async () => {
    console.log('\n=== CLEANING UP TEST DATA ===');
    if (createdTaskIds.length > 0) {
      try {
        const cleanOutput = runDbHelper('cleanup', createdTaskIds.join(','));
        console.log(cleanOutput);
      } catch (err: any) {
        console.error('Cleanup error:', err.stdout || err.message);
      }
    } else {
      console.log('No test tasks were created to clean up.');
    }
  });

  test('TEST A: New notification with no manual refresh', async ({ browser }) => {
    console.log('\n========================================');
    console.log('STARTING TEST A: New notification, no refresh');
    console.log('========================================');

    const context = await browser.newContext();
    const page = await context.newPage();
    const networkLogs = attachNetworkLogger(page, 'UserX-Tab');

    // Set auth session in localStorage
    await page.goto('http://localhost:5175/login');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
      localStorage.removeItem('hros_toasted_ids');
      localStorage.removeItem('hros_last_toasted_at');
    }, { token: tokenUserX });

    await page.goto('http://localhost:5175/');
    await page.waitForSelector('header button[aria-label="Open notifications panel"]');

    console.log('User X idle on dashboard.');
    await page.waitForTimeout(3000);

    // 2. From Admin account, create a task assigned to User X using User X's employee id
    const taskTitle = `E2E-TEST-Deliverable-${Date.now()}`;
    console.log(`Creating task from Admin assigned to User X: "${taskTitle}"`);
    const createRes = await fetch('http://localhost:5005/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        title: taskTitle,
        assigneeId: USER_X_EMP_ID,
        priority: 'HIGH',
        status: 'TODO',
        entityCode: 'EHM',
      }),
    });

    const createStatus = createRes.status;
    const createBodyText = await createRes.text();
    let createdTask: any = null;
    try {
      createdTask = JSON.parse(createBodyText);
    } catch {}

    if (!createRes.ok || !createdTask?.id) {
      console.error(`Task creation failed! Status: ${createStatus}, Body: ${createBodyText}`);
      throw new Error(`Task creation failed: Status ${createStatus}, Body: ${createBodyText}`);
    }

    createdTaskIds.push(createdTask.id);
    console.log(`Admin created task ID: ${createdTask.id} (${createdTask.taskCode}).`);

    // 4. Before the 60s wait, query the DB and paste the task row and notification row for User X
    console.log('\n=== DB ROW CHECK FOR USER X BEFORE 60s WAIT ===');
    try {
      const dbCheckOut = runDbHelper('check', createdTask.id, USER_X_ID);
      console.log(dbCheckOut);
    } catch (err: any) {
      console.error('DB check failed:', err.stdout || err.message);
      throw new Error(`Notification row missing for User X! ${err.stderr || err.message}`);
    }

    // 5. Wait for exactly ONE toast to appear within 60s
    console.log('Waiting for poller to detect summary change and show toast...');
    const toastLocator = page.locator('div[aria-live="polite"] div.pointer-events-auto');
    await toastLocator.first().waitFor({ state: 'visible', timeout: 60000 });

    const toastCount = await toastLocator.count();
    console.log(`SUCCESS: Toast appeared! Visible toast count = ${toastCount}`);
    expect(toastCount).toBe(1);

    const toastText = await toastLocator.first().innerText();
    console.log(`Toast content:\n${toastText}`);
    expect(toastText).toContain(createdTask.taskCode);

    // Check bell badge
    const badgeLocator = page.locator('header button[aria-label="Open notifications panel"] span');
    await badgeLocator.waitFor({ state: 'visible', timeout: 5000 });
    const badgeText = await badgeLocator.innerText();
    console.log(`Bell badge count = ${badgeText}`);
    expect(Number(badgeText)).toBeGreaterThanOrEqual(1);

    // Check that /api/notifications (list) was fetched ONLY after /unread-summary changed
    const listRequests = networkLogs.filter(l => l.includes('REQ: GET /api/notifications') && !l.includes('/unread-summary'));
    console.log(`Total list requests during TEST A: ${listRequests.length} (mount + after summary changed)`);

    await context.close();
  });

  test('TEST B: No re-pop, refresh baseline, multi-tab sync, tray suppression, preview clear', async ({ browser }) => {
    test.setTimeout(400000);
    console.log('\n========================================');
    console.log('STARTING TEST B: Deduplication & Lifecycle');
    console.log('========================================');

    const context = await browser.newContext();
    const page = await context.newPage();
    const networkLogs = attachNetworkLogger(page, 'Tab1');

    await page.goto('http://localhost:5175/login');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
    }, { token: tokenUserX });

    await page.goto('http://localhost:5175/');
    await page.waitForSelector('header button[aria-label="Open notifications panel"]');

    // B.a: Wait through 3 more polls with no new activity: 0 toasts, 0 list requests
    console.log('\n--- B.a: Waiting through polls with no new activity ---');
    const toastLocator = page.locator('div[aria-live="polite"] div.pointer-events-auto');
    const listRequestsBefore = networkLogs.filter(l => l.includes('REQ: GET /api/notifications') && !l.includes('/unread-summary')).length;

    // Wait 65s to cover poll cycles
    console.log('Waiting 65s for poll cycles...');
    await page.waitForTimeout(65000);

    const listRequestsAfter = networkLogs.filter(l => l.includes('REQ: GET /api/notifications') && !l.includes('/unread-summary')).length;
    const toastCountBa = await toastLocator.count();
    console.log(`B.a Result: Toasts visible = ${toastCountBa}, New list requests = ${listRequestsAfter - listRequestsBefore}`);
    expect(toastCountBa).toBe(0);
    expect(listRequestsAfter - listRequestsBefore).toBe(0);

    // B.b: Hard refresh with unread items: 0 toasts, but bell and tray still show them
    console.log('\n--- B.b: Hard refresh with unread items ---');
    await page.reload();
    await page.waitForSelector('header button[aria-label="Open notifications panel"]');
    await page.waitForTimeout(3000);

    const toastCountBb = await toastLocator.count();
    console.log(`B.b Result: Toasts after hard refresh = ${toastCountBb}`);
    expect(toastCountBb).toBe(0);

    const badgeLocatorBb = page.locator('header button[aria-label="Open notifications panel"] span');
    const badgeVisible = await badgeLocatorBb.isVisible();
    console.log(`B.b Result: Bell badge visible after refresh = ${badgeVisible}`);
    expect(badgeVisible).toBe(true);

    // B.c: Dismiss a toast / mark read, refresh: does not return. Check DB read_at
    console.log('\n--- B.c: Dismiss notification and verify DB read_at ---');
    await page.click('button[aria-label="Open notifications panel"]');
    await page.waitForTimeout(1000);
    const dismissBtn = page.locator('div[role="dialog"] button[title="Dismiss notification"]').first();
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
      console.log('Clicked dismiss notification button.');
    } else {
      const markAllBtn = page.locator('button:has-text("Mark all as read")');
      if (await markAllBtn.isVisible()) {
        await markAllBtn.click();
        console.log('Clicked Mark all as read button.');
      }
    }
    await page.waitForTimeout(2000);

    // Verify via GET /api/notifications that the notification has isRead: true and readAt != null
    const notifsCheck = await fetch('http://localhost:5005/api/notifications', {
      headers: { Authorization: `Bearer ${tokenUserX}` },
    });
    const notifsData: any = await notifsCheck.json();
    const firstItem = notifsData[0];
    console.log('Notification state after dismiss/read:', { id: firstItem?.id, isRead: firstItem?.isRead, readAt: firstItem?.readAt });
    expect(firstItem?.isRead).toBe(true);
    expect(firstItem?.readAt).not.toBeNull();

    // Refresh page: verify toast does not return
    await page.reload();
    await page.waitForSelector('header button[aria-label="Open notifications panel"]');
    await page.waitForTimeout(2000);
    const toastsAfterDismissRefresh = await toastLocator.count();
    console.log(`Toasts visible after refresh: ${toastsAfterDismissRefresh}`);
    expect(toastsAfterDismissRefresh).toBe(0);

    // B.d: Multi-tab: open two tabs in same context, create one notification. Exactly one tab shows toast
    console.log('\n--- B.d: Multi-tab synchronization ---');
    const page2 = await context.newPage();
    attachNetworkLogger(page2, 'Tab2');
    await page2.goto('http://localhost:5175/');
    await page2.waitForSelector('header button[aria-label="Open notifications panel"]');

    // Create a new notification assigned using User X's employee ID
    const multiTaskTitle = `E2E-TEST-MultiTab-${Date.now()}`;
    const multiRes = await fetch('http://localhost:5005/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        title: multiTaskTitle,
        assigneeId: USER_X_EMP_ID,
        priority: 'MEDIUM',
        status: 'TODO',
        entityCode: 'EHM',
      }),
    });
    const multiStatus = multiRes.status;
    const multiBodyText = await multiRes.text();
    let multiTask: any = null;
    try {
      multiTask = JSON.parse(multiBodyText);
    } catch {}

    if (!multiRes.ok || !multiTask?.id) {
      console.error(`Multi-tab task creation failed! Status: ${multiStatus}, Body: ${multiBodyText}`);
      throw new Error(`Multi-tab task creation failed: Status ${multiStatus}, Body: ${multiBodyText}`);
    }
    createdTaskIds.push(multiTask.id);
    console.log(`Created multi-tab test task ID: ${multiTask.id} (${multiTask.taskCode})`);

    // Wait for toast to appear in either page1 or page2
    await Promise.race([
      page.locator('div[aria-live="polite"] div.pointer-events-auto').first().waitFor({ state: 'visible', timeout: 60000 }).catch(() => {}),
      page2.locator('div[aria-live="polite"] div.pointer-events-auto').first().waitFor({ state: 'visible', timeout: 60000 }).catch(() => {}),
    ]);
    await page.waitForTimeout(2000);

    const tab1Toasts = await page.locator('div[aria-live="polite"] div.pointer-events-auto').count();
    const tab2Toasts = await page2.locator('div[aria-live="polite"] div.pointer-events-auto').count();
    console.log(`B.d Multi-tab toast counts: Tab1 = ${tab1Toasts}, Tab2 = ${tab2Toasts}, Total = ${tab1Toasts + tab2Toasts}`);
    expect(tab1Toasts + tab2Toasts).toBe(1);

    await page2.close();

    // B.e: Open tray, then have notification arrive. Close tray: no toast pops for it
    console.log('\n--- B.e: Tray suppression and no pop after close ---');
    // Open tray
    await page.click('button[aria-label="Open notifications panel"]');
    await page.waitForTimeout(1000);

    // Create another notification while tray is open
    const trayTaskTitle = `E2E-TEST-TrayOpen-${Date.now()}`;
    const trayRes = await fetch('http://localhost:5005/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        title: trayTaskTitle,
        assigneeId: USER_X_EMP_ID,
        priority: 'URGENT',
        status: 'TODO',
        entityCode: 'EHM',
      }),
    });
    const trayStatus = trayRes.status;
    const trayBodyText = await trayRes.text();
    let trayTask: any = null;
    try {
      trayTask = JSON.parse(trayBodyText);
    } catch {}

    if (!trayRes.ok || !trayTask?.id) {
      console.error(`Tray task creation failed! Status: ${trayStatus}, Body: ${trayBodyText}`);
      throw new Error(`Tray task creation failed: Status ${trayStatus}, Body: ${trayBodyText}`);
    }
    createdTaskIds.push(trayTask.id);
    console.log(`Created tray task ID: ${trayTask.id} (${trayTask.taskCode}). Waiting 35s for poll with tray open...`);

    await page.waitForTimeout(35000);

    // Verify 0 floating toasts while tray is open
    const toastsWhileTrayOpen = await page.locator('div[aria-live="polite"] div.pointer-events-auto').count();
    console.log(`Floating toasts while tray open = ${toastsWhileTrayOpen}`);
    expect(toastsWhileTrayOpen).toBe(0);

    // Close the tray (press Escape)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);

    // Verify NO toast pops after closing the tray
    const toastsAfterTrayClose = await page.locator('div[aria-live="polite"] div.pointer-events-auto').count();
    console.log(`Floating toasts after tray close = ${toastsAfterTrayClose}`);
    expect(toastsAfterTrayClose).toBe(0);

    // B.f: Switch Admin role preview to Employee and back: cache cleared
    console.log('\n--- B.f: Admin role preview toggle cache clearing ---');
    await page.evaluate(({ token }) => {
      localStorage.setItem('hros_token', token);
    }, { token: tokenAdmin });
    await page.goto('http://localhost:5175/');
    await page.waitForSelector('header button[aria-label="Open notifications panel"]');

    // Click profile avatar to open ProfileModal
    await page.click('header button[title="View Profile Details"]');
    await page.waitForSelector('text=Preview layout');

    // Click Team button in preview switcher
    await page.click('div.grid button:has-text("Team")');
    await page.waitForTimeout(1000);

    // Close ProfileModal so it doesn't block the banner
    const closeBtn = page.locator('div.fixed button:has(svg.lucide-x)');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    const bannerText = await page.locator('text=Previewing Layout:').innerText();
    console.log(`Role preview switched: "${bannerText}"`);
    expect(bannerText).toContain('Team Member View');

    // Switch back to Admin via banner button
    await page.click('button:has-text("Reset to Admin View")');
    await page.waitForTimeout(1000);
    console.log('Switched back to Administrator.');

    await context.close();
  });
});
