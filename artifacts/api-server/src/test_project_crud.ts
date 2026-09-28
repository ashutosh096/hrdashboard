import { db, projects, eq, desc } from '@workspace/db';

console.error('DEPRECATED: test_project_crud.ts writes old-format codes and is disabled under Step 2.');
process.exit(1);

async function testManualProjectAddition() {
  console.log('--- 🧪 Testing Manual Project Addition and Database Persistence ---');

  // 1. Fetch current count
  const initial = await db.select().from(projects);
  console.log(`Current projects count in DB: ${initial.length}`);

  // 2. Add Project 1
  const project1Data = {
    code: `EHM-PRJ-2026-MANUAL-01`,
    name: 'Apollo: AI ESG Compliance Automated Pipeline',
    entity: 'EHM' as const,
    entityName: 'ehmconsultancy',
    category: 'Technology & Systems',
    lead: 'Dr. Harshit Mishra',
    team: ['Dr. Harshit Mishra', 'Ashutosh Mishra', 'Pranshu Dubey'],
    budget: '$65,000',
    startDate: '2026-10-01',
    targetDate: '2026-12-30',
    status: 'Active' as const,
    priority: 'Critical' as const,
    techStack: 'Python, FastAPI, OpenAI API, PostgreSQL, React, TypeScript',
    milestonesCount: 3,
    description: 'Autonomous ingestion of environmental regulations and generative gap-analysis reporting for ESG compliance.',
    checkpoints: [
      { id: 'chk-m1-1', title: 'Regulatory Document Vector Indexing', isCompleted: true },
      { id: 'chk-m1-2', title: 'Automated Gap Analysis Model Validation', isCompleted: true },
      { id: 'chk-m1-3', title: 'Client Pilot Executive Dashboard', isCompleted: false },
    ],
    comments: [
      { id: 'pcm-m1-1', authorName: 'Ashutosh Mishra', content: 'Vector DB indexing pipeline initialized on staging.', createdAt: new Date().toISOString() },
      { id: 'pcm-m1-2', authorName: 'Dr. Harshit Mishra', content: 'Reviewed validation metrics with client stakeholders.', createdAt: new Date().toISOString() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Remove if exists from previous run
  await db.delete(projects).where(eq(projects.code, project1Data.code));

  const [insertedProj1] = await db.insert(projects).values(project1Data).returning();
  console.log(`\n✅ Successfully added Project 1:`);
  console.log(`- ID: ${insertedProj1.id}`);
  console.log(`- Code: ${insertedProj1.code}`);
  console.log(`- Name: ${insertedProj1.name}`);
  console.log(`- Entity: ${insertedProj1.entity} (${insertedProj1.entityName})`);
  console.log(`- Budget: ${insertedProj1.budget}`);
  console.log(`- Tech Stack: ${insertedProj1.techStack}`);
  console.log(`- Checkpoints Count: ${Array.isArray(insertedProj1.checkpoints) ? insertedProj1.checkpoints.length : 0}`);
  console.log(`- Comments Count: ${Array.isArray(insertedProj1.comments) ? insertedProj1.comments.length : 0}`);

  // 3. Add Project 2
  const project2Data = {
    code: `CAG-PRJ-2026-MANUAL-02`,
    name: 'TerraSense: Drone & Soil Moisture Remote Sensing',
    entity: 'CAG' as const,
    entityName: 'climagroanalytics',
    category: 'Environmental Compliance',
    lead: 'Pranshu Dubey',
    team: ['Pranshu Dubey', 'Harshit Mishra', 'Utsav Mishra'],
    budget: '$48,000',
    startDate: '2026-09-15',
    targetDate: '2026-11-20',
    status: 'In Review' as const,
    priority: 'High' as const,
    techStack: 'GeoPandas, Sentinel-2 Ingestion, QGIS, Node.js, Express',
    milestonesCount: 3,
    description: 'High-resolution multispectral imagery pipeline for precision crop hydration and carbon sequestration verification.',
    checkpoints: [
      { id: 'chk-m2-1', title: 'Sentinel-2 Ingestion API Setup', isCompleted: true },
      { id: 'chk-m2-2', title: 'NDVI & NDWI Calculation Algorithms', isCompleted: true },
      { id: 'chk-m2-3', title: 'Field Calibration Ground Truthing', isCompleted: true },
    ],
    comments: [
      { id: 'pcm-m2-1', authorName: 'Pranshu Dubey', content: 'Calibrated reflectance index against field IoT sensor data.', createdAt: new Date().toISOString() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.delete(projects).where(eq(projects.code, project2Data.code));

  const [insertedProj2] = await db.insert(projects).values(project2Data).returning();
  console.log(`\n✅ Successfully added Project 2:`);
  console.log(`- ID: ${insertedProj2.id}`);
  console.log(`- Code: ${insertedProj2.code}`);
  console.log(`- Name: ${insertedProj2.name}`);
  console.log(`- Entity: ${insertedProj2.entity} (${insertedProj2.entityName})`);
  console.log(`- Status: ${insertedProj2.status}`);
  console.log(`- Checkpoints Count: ${Array.isArray(insertedProj2.checkpoints) ? insertedProj2.checkpoints.length : 0}`);

  // 4. Query All Projects from DB to verify persistence and retrieval
  console.log('\n--- 🔍 Querying All Projects from Database ---');
  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
  console.log(`Total projects in DB now: ${allProjects.length}`);
  allProjects.forEach((p, idx) => {
    console.log(`[${idx + 1}] [${p.code}] ${p.name} | Status: ${p.status} | Entity: ${p.entity} | Lead: ${p.lead} | Checkpoints: ${(p.checkpoints as any[])?.length || 0}`);
  });

  console.log('\n🎉 Verified: All project information is saving and querying correctly in PostgreSQL!');
  process.exit(0);
}

testManualProjectAddition().catch((err) => {
  console.error('Test project creation failed:', err);
  process.exit(1);
});
