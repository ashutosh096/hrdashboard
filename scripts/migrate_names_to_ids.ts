import { db, epics, projects, employees, eq } from '@workspace/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUUID(str: any): boolean {
  if (typeof str !== 'string') return false;
  return UUID_REGEX.test(str.trim());
}

const NAME_MAPPING: Record<string, string> = {
  'Harshit Mishra': '1e32f27a-d641-40ff-923c-05fef4836c10',
  'Jitendra Singh': '62785b3e-f538-4618-a412-436f3c3408f1',
  'Neha Shukla': '2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e',
  'Utsav Mishra': 'a9918b75-cba5-46e9-8bee-e9c536a331cc',
  'Pranshu Dubey': '67f526ba-afcf-4ec0-bf41-da1468bfb816', // Pranshu Mohan (dubey.pranshu@gmail.com)
};

async function executeMigration() {
  console.log('=== STARTING MIGRATION INSIDE A SINGLE TRANSACTION ===\n');

  const changedProjects: { id: string; code: string; name: string; oldValue: string; newValue: string }[] = [];
  const changedEpics: { id: string; code: string; title: string; oldValue: string; newValue: string }[] = [];

  try {
    await db.transaction(async (tx) => {
      // 1. Projects table
      const allProjects = await tx.select().from(projects);
      for (const p of allProjects) {
        if (p.lead && !isUUID(p.lead)) {
          const trimmed = p.lead.trim();
          const targetId = NAME_MAPPING[trimmed];
          if (!targetId) {
            throw new Error(`Unmapped name found in projects.lead: "${p.lead}" (id=${p.id}, code=${p.code}). Rolling back!`);
          }
          await tx.update(projects).set({ lead: targetId }).where(eq(projects.id, p.id));
          changedProjects.push({
            id: p.id,
            code: p.code,
            name: p.name,
            oldValue: p.lead,
            newValue: targetId,
          });
        }
      }

      // 2. Epics table
      const allEpics = await tx.select().from(epics);
      for (const ep of allEpics) {
        if (ep.assignedTo) {
          let parsed = ep.assignedTo;
          try {
            parsed = JSON.parse(ep.assignedTo);
          } catch {}
          if (Array.isArray(parsed)) {
            let modified = false;
            const newArr: string[] = [];
            for (const item of parsed) {
              if (item && !isUUID(item)) {
                const trimmed = item.trim();
                const targetId = NAME_MAPPING[trimmed];
                if (!targetId) {
                  throw new Error(`Unmapped name found in epics.assignedTo: "${item}" (id=${ep.id}, code=${ep.epicCode}). Rolling back!`);
                }
                newArr.push(targetId);
                modified = true;
              } else {
                newArr.push(item);
              }
            }
            if (modified) {
              const updatedStr = JSON.stringify(newArr);
              await tx.update(epics).set({ assignedTo: updatedStr }).where(eq(epics.id, ep.id));
              changedEpics.push({
                id: ep.id,
                code: ep.epicCode,
                title: ep.title,
                oldValue: ep.assignedTo,
                newValue: updatedStr,
              });
            }
          }
        }
      }

      // Verification INSIDE transaction: confirm NO unconverted names remain
      const postProjects = await tx.select().from(projects);
      for (const p of postProjects) {
        if (p.lead && !isUUID(p.lead)) {
          throw new Error(`POST-CHECK FAILED: projects.lead "${p.lead}" is not a UUID (id=${p.id}). Rolling back transaction!`);
        }
      }

      const postEpics = await tx.select().from(epics);
      for (const ep of postEpics) {
        if (ep.assignedTo) {
          let parsed = ep.assignedTo;
          try { parsed = JSON.parse(ep.assignedTo); } catch {}
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && !isUUID(item)) {
                throw new Error(`POST-CHECK FAILED: epics.assignedTo contains non-UUID "${item}" (id=${ep.id}). Rolling back transaction!`);
              }
            }
          }
        }
      }

      console.log('Verification passed inside transaction: 0 names remaining in projects.lead and epics.assigned_to.');
      console.log('Committing transaction...\n');
    });

    console.log('=== TRANSACTION COMMITTED SUCCESSFULLY ===\n');

    console.log('CHANGED PROJECTS:');
    console.table(changedProjects);

    console.log('\nCHANGED EPICS:');
    console.table(changedEpics);

  } catch (err: any) {
    console.error('*** TRANSACTION FAILED AND ROLLED BACK ***');
    console.error(err.message || err);
    process.exit(1);
  }
}

executeMigration().then(() => {
  process.exit(0);
});
