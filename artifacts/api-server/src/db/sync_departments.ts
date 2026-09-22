import { db, entities, departments, employees, eq, and } from '@workspace/db';

async function syncDepartments() {
  console.log('[SYNC DEPARTMENTS] Starting sync...');
  
  const allEntities = await db.select().from(entities);
  console.log(`[SYNC DEPARTMENTS] Found ${allEntities.length} entities.`);

  const departmentsData = [
    { code: 'MAR', name: 'Marketing' },
    { code: 'SAL', name: 'Sales' },
    { code: 'TEC', name: 'Product & Tech' },
    { code: 'OPS', name: 'Operations & Delivery' },
    { code: 'GOV', name: 'Grants & Governance' },
  ];

  for (const ent of allEntities) {
    for (const d of departmentsData) {
      let [existing] = await db
        .select()
        .from(departments)
        .where(and(eq(departments.entityId, ent.id), eq(departments.name, d.name)));

      if (!existing) {
        // Also check by code
        [existing] = await db
          .select()
          .from(departments)
          .where(and(eq(departments.entityId, ent.id), eq(departments.code, d.code)));
      }

      if (!existing) {
        const [inserted] = await db
          .insert(departments)
          .values({
            entityId: ent.id,
            code: d.code,
            name: d.name,
          })
          .returning();
        console.log(`[SYNC DEPARTMENTS] Inserted department: ${d.name} (${d.code}) for entity ${ent.name}`);
      } else {
        await db
          .update(departments)
          .set({ name: d.name, code: d.code })
          .where(eq(departments.id, existing.id));
        console.log(`[SYNC DEPARTMENTS] Updated department: ${d.name} (${d.code}) for entity ${ent.name}`);
      }
    }
  }

  // Update legacy "DEV" or "Engineering & Product" departments to "Product & Tech"
  const legacyDepts = await db.select().from(departments);
  for (const dept of legacyDepts) {
    if (dept.name.includes('Engineering') || dept.code === 'DEV') {
      await db.update(departments).set({ name: 'Product & Tech', code: 'TEC' }).where(eq(departments.id, dept.id));
      console.log(`[SYNC DEPARTMENTS] Migrated legacy department ${dept.id} to "Product & Tech"`);
    }
  }

  console.log('[SYNC DEPARTMENTS] Sync completed successfully!');
  process.exit(0);
}

syncDepartments().catch(err => {
  console.error('[SYNC DEPARTMENTS ERROR]:', err);
  process.exit(1);
});
