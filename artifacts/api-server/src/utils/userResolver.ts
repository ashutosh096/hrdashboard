import { db, users, employees, eq, inArray } from '@workspace/db';

/**
 * In-memory short-lived cache for employeeId <-> userId lookups to avoid redundant DB roundtrips.
 */
const empToUserCache = new Map<string, { userId: string; timestamp: number }>();
const userToEmpCache = new Map<string, { employeeId: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Resolves a canonical user.id from an employeeId (UUID or employee record ID).
 * If the input is already a user.id, it returns it directly.
 */
export async function resolveUserIdFromEmployeeId(employeeOrUserId?: string | null): Promise<string | null> {
  if (!employeeOrUserId) return null;
  const rawId = employeeOrUserId.trim();
  if (!rawId) return null;

  // Check cache
  const cached = empToUserCache.get(rawId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.userId;
  }

  try {
    // 1. Check if rawId is already a user.id
    const [userRowById] = await db.select({ id: users.id }).from(users).where(eq(users.id, rawId)).limit(1);
    if (userRowById) {
      empToUserCache.set(rawId, { userId: userRowById.id, timestamp: Date.now() });
      return userRowById.id;
    }

    // 2. Query users where users.employeeId = rawId
    const [userRowByEmp] = await db.select({ id: users.id }).from(users).where(eq(users.employeeId, rawId)).limit(1);
    if (userRowByEmp) {
      empToUserCache.set(rawId, { userId: userRowByEmp.id, timestamp: Date.now() });
      return userRowByEmp.id;
    }

    return null;
  } catch (err) {
    console.error(`[USER RESOLVER ERROR] Failed to resolve user.id for: ${rawId}`, err);
    return null;
  }
}

/**
 * Batch resolves canonical user.id array from an array of employeeIds or userIds.
 */
export async function resolveUserIdsFromEmployeeIds(employeeOrUserIds: (string | null | undefined)[]): Promise<string[]> {
  const filtered = Array.from(new Set(employeeOrUserIds.filter(Boolean) as string[])).map(id => id.trim());
  if (filtered.length === 0) return [];

  const results: string[] = [];
  const uncached: string[] = [];

  for (const id of filtered) {
    const cached = empToUserCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      results.push(cached.userId);
    } else {
      uncached.push(id);
    }
  }

  if (uncached.length > 0) {
    try {
      // Find matching user.id directly
      const byUserIds = await db.select({ id: users.id }).from(users).where(inArray(users.id, uncached));
      const foundUserIds = new Set(byUserIds.map(u => u.id));

      for (const uid of foundUserIds) {
        results.push(uid);
        empToUserCache.set(uid, { userId: uid, timestamp: Date.now() });
      }

      const stillUnresolved = uncached.filter(id => !foundUserIds.has(id));
      if (stillUnresolved.length > 0) {
        const byEmpIds = await db.select({ id: users.id, employeeId: users.employeeId }).from(users).where(inArray(users.employeeId, stillUnresolved));
        for (const row of byEmpIds) {
          if (row.employeeId) {
            results.push(row.id);
            empToUserCache.set(row.employeeId, { userId: row.id, timestamp: Date.now() });
          }
        }
      }
    } catch (err) {
      console.error('[BATCH USER RESOLVER ERROR]:', err);
    }
  }

  return Array.from(new Set(results));
}
