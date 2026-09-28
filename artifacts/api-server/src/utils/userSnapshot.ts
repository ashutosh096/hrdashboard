import { db, employees, eq } from '@workspace/db';

export async function getCallerInfo(user: any, tx?: any): Promise<{ employeeId: string | null; callerName: string }> {
  const runner = tx || db;
  let employeeId = user?.employeeId || null;
  let callerName = user?.email?.split('@')[0] || 'Unknown';

  if (employeeId) {
    const [emp] = await runner.select().from(employees).where(eq(employees.id, employeeId));
    if (emp) {
      callerName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeCode || callerName;
      return { employeeId: emp.id, callerName };
    }
  }

  if (user?.email) {
    const [emp] = await runner.select().from(employees).where(eq(employees.email, user.email));
    if (emp) {
      callerName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeCode || callerName;
      return { employeeId: emp.id, callerName };
    }
  }

  return { employeeId, callerName };
}
