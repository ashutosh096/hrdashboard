import { db, projects } from '@workspace/db';

async function seedProjects() {
  console.log('Seeding initial foundational projects into Postgres...');

  const initialList = [
    {
      code: 'EHM-PRJ-2026-01',
      name: 'Orion: Enterprise Platform & Brand Architecture',
      entity: 'EHM' as const,
      entityName: 'ehmconsultancy',
      category: 'Technology & Systems',
      lead: 'Ashutosh Mishra',
      team: ['Ashutosh Mishra', 'Pranshu Dubey', 'Harshit Mishra'],
      budget: '$50,000',
      startDate: '2026-08-01',
      targetDate: '2026-11-30',
      status: 'Active' as const,
      priority: 'High' as const,
      techStack: 'React, Node.js, PostgreSQL, TypeScript',
      milestonesCount: 4,
      description: 'End-to-end multi-tenant HR & operations operating system for enterprise client management.',
      checkpoints: [
        { id: 'chk-1', title: 'System Architecture & Database Schema Design', isCompleted: true },
        { id: 'chk-2', title: 'RBAC & Multi-Role Authentication Setup', isCompleted: true },
        { id: 'chk-3', title: 'Real-time Project & Sprint Workflow Sync', isCompleted: true },
        { id: 'chk-4', title: 'Final QA & Security Hardening', isCompleted: false },
      ],
      comments: [
        { id: 'pcm-1', authorName: 'Ashutosh Mishra', content: 'Database persistence and schema verification completed.', createdAt: new Date().toISOString() },
      ],
    },
    {
      code: 'CAG-PRJ-2026-02',
      name: 'Zenith: Climate & IoT Sensor Telemetry Gateway',
      entity: 'CAG' as const,
      entityName: 'climagroanalytics',
      category: 'Environmental Compliance',
      lead: 'Pranshu Dubey',
      team: ['Pranshu Dubey', 'Harshit Mishra', 'Eustace'],
      budget: '$42,000',
      startDate: '2026-08-15',
      targetDate: '2026-12-20',
      status: 'Active' as const,
      priority: 'High' as const,
      techStack: 'Python, GIS, Fastify, Docker, TimescaleDB',
      milestonesCount: 4,
      description: 'Agricultural and environmental climate sensor ingestion pipeline with real-time analytics.',
      checkpoints: [
        { id: 'chk-21', title: 'Sensor Hardware API Integration', isCompleted: true },
        { id: 'chk-22', title: 'Geospatial Mapping & Ingestion Pipeline', isCompleted: true },
        { id: 'chk-23', title: 'Anomaly Detection & Alert Rules', isCompleted: false },
        { id: 'chk-24', title: 'Client Dashboard Reporting Delivery', isCompleted: false },
      ],
      comments: [
        { id: 'pcm-2', authorName: 'Pranshu Dubey', content: 'Sensor gateway telemetry pipeline configured.', createdAt: new Date().toISOString() },
      ],
    },
    {
      code: 'EHM-PRJ-2026-03',
      name: 'Helios: Environmental Compliance & Audit Engine',
      entity: 'EHM' as const,
      entityName: 'ehmconsultancy',
      category: 'Environmental Compliance',
      lead: 'Harshit Mishra',
      team: ['Harshit Mishra', 'Ashutosh Mishra', 'Utsav Mishra'],
      budget: '$35,000',
      startDate: '2026-09-01',
      targetDate: '2026-12-31',
      status: 'Planning' as const,
      priority: 'Medium' as const,
      techStack: 'React, TailwindCSS, Express, PostgreSQL',
      milestonesCount: 4,
      description: 'Automated compliance auditing framework and reporting generator for statutory environmental requirements.',
      checkpoints: [
        { id: 'chk-31', title: 'Statutory Requirement Matrix Review', isCompleted: true },
        { id: 'chk-32', title: 'Automated Scorecard Engine Implementation', isCompleted: false },
        { id: 'chk-33', title: 'Export PDF / CSV Audit Report Engine', isCompleted: false },
        { id: 'chk-34', title: 'Pilot Client Trial & Feedback', isCompleted: false },
      ],
      comments: [
        { id: 'pcm-3', authorName: 'Harshit Mishra', content: 'Compliance checklist draft uploaded.', createdAt: new Date().toISOString() },
      ],
    },
  ];

  for (const proj of initialList) {
    const existing = await db.select().from(projects);
    const match = existing.find(p => p.code === proj.code);
    if (!match) {
      await db.insert(projects).values({
        ...proj,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Seeded project: ${proj.code} (${proj.name})`);
    } else {
      console.log(`ℹ️ Project ${proj.code} already exists, preserved without alteration.`);
    }
  }

  console.log('Project database initialization complete.');
  process.exit(0);
}

seedProjects().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
