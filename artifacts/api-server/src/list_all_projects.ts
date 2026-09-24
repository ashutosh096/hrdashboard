import { db, projects, desc } from '@workspace/db';

async function listAllProjects() {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
  console.log(`\n================== CURRENT DATABASE PROJECTS (${allProjects.length}) ==================`);
  allProjects.forEach((p, idx) => {
    console.log(`\n[#${idx + 1}] ID: ${p.id}`);
    console.log(`     Code: ${p.code} | Name: ${p.name}`);
    console.log(`     Entity: ${p.entity} (${p.entityName}) | Category: ${p.category}`);
    console.log(`     Lead: ${p.lead} | Priority: ${p.priority} | Status: ${p.status}`);
    console.log(`     Budget: ${p.budget} | Timeline: ${p.startDate} -> ${p.targetDate}`);
    console.log(`     Tech Stack: ${p.techStack}`);
    console.log(`     Description: ${p.description}`);
    console.log(`     Checkpoints (${(p.checkpoints as any[])?.length || 0}):`, JSON.stringify(p.checkpoints));
    console.log(`     Comments (${(p.comments as any[])?.length || 0}):`, JSON.stringify(p.comments));
  });
  console.log('\n==================================================================================\n');
  process.exit(0);
}

listAllProjects().catch((err) => {
  console.error(err);
  process.exit(1);
});
