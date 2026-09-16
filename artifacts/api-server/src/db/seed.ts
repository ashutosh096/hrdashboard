import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, employees, entities, departments, entityCounters, initiatives, epics, sprints, tasks, attendance, meetings, meetingAttendees, and, eq } from '@workspace/db';

dotenv.config();

export async function runSeed() {
  console.log('[SEED] Seeding database with HROS initial data...');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
    // 1. Seed / Upsert Entities (EHM & CAG)
    const entitiesList = [
      { code: 'EHM', name: 'EHM' },
      { code: 'CAG', name: 'CLIMAGRO' },
    ];

    const seededEntities: Record<string, string> = {};

    for (const ent of entitiesList) {
      let [existingEntity] = await db
        .select()
        .from(entities)
        .where(eq(entities.code, ent.code));

      if (!existingEntity) {
        [existingEntity] = await db
          .insert(entities)
          .values({ code: ent.code, name: ent.name })
          .returning();
        console.log(`[SEED] Entity inserted: ${ent.code} (${ent.name})`);
      } else {
        console.log(`[SEED] Entity exists: ${ent.code}`);
      }

      seededEntities[ent.code] = existingEntity.id;

      // Seed / Upsert Entity Counter
      const [existingCounter] = await db
        .select()
        .from(entityCounters)
        .where(eq(entityCounters.entityId, existingEntity.id));

      if (!existingCounter) {
        await db
          .insert(entityCounters)
          .values({ entityId: existingEntity.id, nextEmployeeSeq: 4 });
        console.log(`[SEED] Entity Counter initialized for ${ent.code}`);
      }
    }

    // 2. Seed / Upsert Departments (MAR, DEV, OPS, HR, FIN)
    const departmentsData = [
      { code: 'MAR', name: 'Marketing' },
      { code: 'DEV', name: 'Engineering & Product' },
      { code: 'OPS', name: 'Operations' },
      { code: 'HR', name: 'Human Resources' },
      { code: 'FIN', name: 'Finance' },
    ];

    const seededDepts: Record<string, string> = {};

    for (const entityCode of ['EHM', 'CAG']) {
      const entityId = seededEntities[entityCode];
      for (const dept of departmentsData) {
        let [existingDept] = await db
          .select()
          .from(departments)
          .where(and(eq(departments.entityId, entityId), eq(departments.code, dept.code)));

        if (!existingDept) {
          [existingDept] = await db
            .insert(departments)
            .values({ entityId, code: dept.code, name: dept.name })
            .returning();
          console.log(`[SEED] Department inserted: ${dept.code} for ${entityCode}`);
        }
        seededDepts[`${entityCode}_${dept.code}`] = existingDept.id;
      }
    }

    // 3. Seed / Upsert Admin & Team Employee Records
    const teamMembersData = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        employeeCode: 'EHM-EMP01',
        entityCode: 'EHM',
        deptCode: 'DEV',
        designation: 'System Administrator & VP Tech',
        salary: '150000',
      },
      {
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.j@ehmconsultancy.com',
        employeeCode: 'EHM-EMP02',
        entityCode: 'EHM',
        deptCode: 'DEV',
        designation: 'Lead Product Manager',
        salary: '120000',
      },
      {
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.r@ehmconsultancy.com',
        employeeCode: 'EHM-EMP03',
        entityCode: 'EHM',
        deptCode: 'OPS',
        designation: 'Senior Fullstack Engineer',
        salary: '110000',
      },
      {
        firstName: 'Vikram',
        lastName: 'Sharma',
        email: 'vikram.s@climagro.com',
        employeeCode: 'CAG-EMP01',
        entityCode: 'CAG',
        deptCode: 'DEV',
        designation: 'Principal Carbon & AI Specialist',
        salary: '135000',
      },
      {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.p@climagro.com',
        employeeCode: 'CAG-EMP02',
        entityCode: 'CAG',
        deptCode: 'OPS',
        designation: 'Agile Delivery Lead',
        salary: '105000',
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.k@climagro.com',
        employeeCode: 'CAG-EMP03',
        entityCode: 'CAG',
        deptCode: 'DEV',
        designation: 'Sustainability Data Analyst',
        salary: '95000',
      },
    ];

    const seededEmployeesMap: Record<string, any> = {};

    for (const tm of teamMembersData) {
      let [emp] = await db.select().from(employees).where(eq(employees.employeeCode, tm.employeeCode));
      if (!emp) {
        [emp] = await db.select().from(employees).where(eq(employees.email, tm.email));
      }

      if (!emp) {
        [emp] = await db
          .insert(employees)
          .values({
            firstName: tm.firstName,
            lastName: tm.lastName,
            email: tm.email,
            employeeCode: tm.employeeCode,
            entityId: seededEntities[tm.entityCode],
            departmentId: seededDepts[`${tm.entityCode}_${tm.deptCode}`],
            designation: tm.designation,
            salary: tm.salary,
            joiningDate: new Date(),
          })
          .returning();
        console.log(`[SEED] Employee inserted: ${tm.employeeCode} (${tm.email})`);
      } else {
        await db
          .update(employees)
          .set({
            firstName: tm.firstName,
            lastName: tm.lastName,
            designation: tm.designation,
          })
          .where(eq(employees.id, emp.id));
      }
      seededEmployeesMap[tm.employeeCode] = emp;
    }

    const adminEmployee = seededEmployeesMap['EHM-EMP01'];

    // 4. Seed / Upsert Admin User
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (!existingUser) {
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        employeeId: adminEmployee.id,
      });
      console.log(`[SEED] Admin User inserted: ${adminEmail}`);
    } else {
      await db.update(users)
        .set({ passwordHash, role: 'ADMIN', status: 'ACTIVE', employeeId: adminEmployee.id })
        .where(eq(users.email, adminEmail));
      console.log(`[SEED] Admin User updated: ${adminEmail}`);
    }

    const secondaryEmail = 'ashutosh@ehmconsultancy.com';
    const [existingSecUser] = await db.select().from(users).where(eq(users.email, secondaryEmail));
    if (!existingSecUser) {
      await db.insert(users).values({
        email: secondaryEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        employeeId: adminEmployee.id,
      });
      console.log(`[SEED] Secondary Admin User inserted: ${secondaryEmail}`);
    } else {
      await db.update(users)
        .set({ passwordHash, role: 'ADMIN', status: 'ACTIVE', employeeId: adminEmployee.id })
        .where(eq(users.email, secondaryEmail));
      console.log(`[SEED] Secondary Admin User updated: ${secondaryEmail}`);
    }

    // 5. Seed / Upsert 8 Strategic Initiatives
    const initiativesData = [
      {
        initiativeCode: 'CAG-INIT-001',
        title: 'CLIMAGRO Analytics Platform & Carbon Engine',
        description: 'Core sustainability platform & AI carbon footprint analytics module.',
        entityCode: 'CAG',
        deptCode: 'DEV',
        subDepartment: 'Product & Tech - Core Engine',
        targetMonth: 'Month 1 (Weeks 1–4)',
        epicsCountTarget: 3,
        targetDeliverableMetric: '100% OAuth & Carbon Reporting Pass',
        status: 'ACTIVE',
      },
      {
        initiativeCode: 'EHM-INIT-001',
        title: 'EHM Operational ERP & Client Portal',
        description: 'Environmental consultancy workflow & compliance tracking dashboard.',
        entityCode: 'EHM',
        deptCode: 'DEV',
        subDepartment: 'Operations & Tech',
        targetMonth: 'Month 1 (Weeks 1–4)',
        epicsCountTarget: 3,
        targetDeliverableMetric: 'Automated Compliance Workflow',
        status: 'ACTIVE',
      },
      {
        initiativeCode: 'CAG-INIT-002',
        title: 'AI Scope 3 Supply Chain Footprint & ESG Auditing',
        description: 'Automated Scope 3 emissions tracing and vendor ESG scorecard system.',
        entityCode: 'CAG',
        deptCode: 'DEV',
        subDepartment: 'Product & Tech - AI Lab',
        targetMonth: 'Month 2 (Weeks 5–8)',
        epicsCountTarget: 3,
        targetDeliverableMetric: 'Real-time Supplier Audit Integration',
        status: 'ACTIVE',
      },
      {
        initiativeCode: 'EHM-INIT-002',
        title: 'Environmental Impact Assessment (EIA) Automated Suite',
        description: 'AI-assisted site inspection and automated regulatory PDF generation.',
        entityCode: 'EHM',
        deptCode: 'OPS',
        subDepartment: 'Operations & Delivery',
        targetMonth: 'Month 2 (Weeks 5–8)',
        epicsCountTarget: 3,
        targetDeliverableMetric: '95% Automated PDF Generation',
        status: 'ACTIVE',
      },
      {
        initiativeCode: 'CAG-INIT-003',
        title: 'IoT Sensor Integration & Carbon Grid Live Feed',
        description: 'Direct IoT telemetry stream for industrial facility carbon monitoring.',
        entityCode: 'CAG',
        deptCode: 'DEV',
        subDepartment: 'Product & Tech - IoT Grid',
        targetMonth: 'Month 3 (Weeks 9–12)',
        epicsCountTarget: 3,
        targetDeliverableMetric: 'Live Ingestion Stream < 50ms Latency',
        status: 'ACTIVE',
      },
      {
        initiativeCode: 'EHM-INIT-003',
        title: 'ISO 14001 Audit & Environmental Governance Suite',
        description: 'Comprehensive audit readiness checklist, evidence locker, and CAPA engine.',
        entityCode: 'EHM',
        deptCode: 'MAR',
        subDepartment: 'Grants & Governance',
        targetMonth: 'Month 1 (Weeks 1–4)',
        epicsCountTarget: 3,
        targetDeliverableMetric: '100% ISO 14001 Audit Readiness',
        status: 'ACTIVE',
      },
      {
        initiativeCode: 'CAG-INIT-004',
        title: 'Carbon Credit Trading & Offset Settlement API',
        description: 'Blockchain-backed carbon credit verification and transaction engine.',
        entityCode: 'CAG',
        deptCode: 'DEV',
        subDepartment: 'Product & Tech - Marketplace',
        targetMonth: 'Month 3 (Weeks 9–12)',
        epicsCountTarget: 2,
        targetDeliverableMetric: 'Tokenized Offset Settlement API',
        status: 'PLANNED',
      },
      {
        initiativeCode: 'EHM-INIT-004',
        title: 'Enterprise Client Onboarding & Contract Lifecycle',
        description: 'Streamlined client intake, NDA execution, and SLA tracking portal.',
        entityCode: 'EHM',
        deptCode: 'MAR',
        subDepartment: 'Sales & Client Experience',
        targetMonth: 'Month 2 (Weeks 5–8)',
        epicsCountTarget: 2,
        targetDeliverableMetric: 'Zero-Touch Contract Execution',
        status: 'PLANNED',
      },
    ];

    const seededInitiativesMap: Record<string, any> = {};

    for (const initData of initiativesData) {
      let [existingInit] = await db.select().from(initiatives).where(eq(initiatives.initiativeCode, initData.initiativeCode));
      if (!existingInit) {
        [existingInit] = await db.insert(initiatives).values({
          initiativeCode: initData.initiativeCode,
          title: initData.title,
          description: initData.description,
          entityId: seededEntities[initData.entityCode],
          departmentId: seededDepts[`${initData.entityCode}_${initData.deptCode}`],
          subDepartment: initData.subDepartment,
          targetMonth: initData.targetMonth,
          epicsCountTarget: initData.epicsCountTarget,
          targetDeliverableMetric: initData.targetDeliverableMetric,
          status: initData.status,
        }).returning();
        console.log(`[SEED] Initiative inserted: ${initData.initiativeCode}`);
      } else {
        await db.update(initiatives).set({
          title: initData.title,
          description: initData.description,
          targetDeliverableMetric: initData.targetDeliverableMetric,
          status: initData.status,
        }).where(eq(initiatives.id, existingInit.id));
      }
      seededInitiativesMap[initData.initiativeCode] = existingInit;
    }

    // 6. Seed / Upsert 24 Feature Epics (3 Epics for EACH of the 8 Strategic Initiatives)
    const epicsData = [
      // CAG-INIT-001 (3 Epics)
      { epicCode: 'CAG-EPIC-001', title: 'Auth, RBAC & Core Analytics Engine', description: 'Multi-tenant authentication and analytics calculation pipeline.', initiativeCode: 'CAG-INIT-001', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 1 (Days 1–7)', status: 'IN_PROGRESS' },
      { epicCode: 'CAG-EPIC-002', title: 'Real-time Carbon Visualizer & Dashboard', description: 'Interactive charts and live emission widget grid.', initiativeCode: 'CAG-INIT-001', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 2 (Days 8–14)', status: 'IN_PROGRESS' },
      { epicCode: 'CAG-EPIC-003', title: 'Automated CSV & PDF Export Engine', description: 'Scheduled export pipelines for monthly ESG reporting.', initiativeCode: 'CAG-INIT-001', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // EHM-INIT-001 (3 Epics)
      { epicCode: 'EHM-EPIC-001', title: 'Client Onboarding & Project Management', description: 'Client portal setup and project deliverable tracking.', initiativeCode: 'EHM-INIT-001', entityCode: 'EHM', department: 'Operations & Delivery', targetWeek: 'Week 1 (Days 1–7)', status: 'COMPLETED' },
      { epicCode: 'EHM-EPIC-002', title: 'Billing, Invoicing & Timesheet Sync', description: 'Consultant billable hours tracking & invoice generation.', initiativeCode: 'EHM-INIT-001', entityCode: 'EHM', department: 'Operations & Tech', targetWeek: 'Week 2 (Days 8–14)', status: 'IN_PROGRESS' },
      { epicCode: 'EHM-EPIC-003', title: 'Compliance Milestone & SLA Tracker', description: 'Automated SLA breach notifications and client alert triggers.', initiativeCode: 'EHM-INIT-001', entityCode: 'EHM', department: 'Operations & Delivery', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // CAG-INIT-002 (3 Epics)
      { epicCode: 'CAG-EPIC-004', title: 'Supplier Onboarding & ESG Survey Engine', description: 'Vendor intake forms, risk evaluation questionnaires, and document uploads.', initiativeCode: 'CAG-INIT-002', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 1 (Days 1–7)', status: 'IN_PROGRESS' },
      { epicCode: 'CAG-EPIC-005', title: 'AI Scope 3 Emission Predictor', description: 'Machine learning model for estimating upstream vendor carbon intensity.', initiativeCode: 'CAG-INIT-002', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 2 (Days 8–14)', status: 'PLANNED' },
      { epicCode: 'CAG-EPIC-006', title: 'ESG Risk Scorecard & Benchmark Analysis', description: 'Comparative ESG scorecards across global industry benchmarks.', initiativeCode: 'CAG-INIT-002', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // EHM-INIT-002 (3 Epics)
      { epicCode: 'EHM-EPIC-004', title: 'EIA Site Inspection Mobile Web App', description: 'Offline-first field survey tool for environmental inspectors.', initiativeCode: 'EHM-INIT-002', entityCode: 'EHM', department: 'Operations & Delivery', targetWeek: 'Week 1 (Days 1–7)', status: 'COMPLETED' },
      { epicCode: 'EHM-EPIC-005', title: 'Automated EIA Regulatory PDF Generator', description: 'One-click PDF generation formatted to ministry standards.', initiativeCode: 'EHM-INIT-002', entityCode: 'EHM', department: 'Operations & Delivery', targetWeek: 'Week 2 (Days 8–14)', status: 'IN_PROGRESS' },
      { epicCode: 'EHM-EPIC-006', title: 'GIS Mapping & Hazard Zone Layer', description: 'Interactive map layer for protected flora, fauna, and water basins.', initiativeCode: 'EHM-INIT-002', entityCode: 'EHM', department: 'Operations & Tech', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // CAG-INIT-003 (3 Epics)
      { epicCode: 'CAG-EPIC-007', title: 'IoT Telemetry MQTT Ingestion Pipeline', description: 'High-throughput MQTT broker integration for real-time sensor streams.', initiativeCode: 'CAG-INIT-003', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 1 (Days 1–7)', status: 'IN_PROGRESS' },
      { epicCode: 'CAG-EPIC-008', title: 'Edge Gateway Device Management Suite', description: 'Remote device health monitoring and firmware update manager.', initiativeCode: 'CAG-INIT-003', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 2 (Days 8–14)', status: 'PLANNED' },
      { epicCode: 'CAG-EPIC-009', title: 'Real-time Carbon Anomaly Alerts Engine', description: 'Threshold triggers and instant Slack/SMS incident alerts.', initiativeCode: 'CAG-INIT-003', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // EHM-INIT-003 (3 Epics)
      { epicCode: 'EHM-EPIC-007', title: 'ISO 14001 Evidence Locker & Vault', description: 'Encrypted document vault for environmental policy records.', initiativeCode: 'EHM-INIT-003', entityCode: 'EHM', department: 'Grants & Governance', targetWeek: 'Week 1 (Days 1–7)', status: 'COMPLETED' },
      { epicCode: 'EHM-EPIC-008', title: 'Non-Conformance Report (NCR) Workflow', description: 'Root cause analysis workflow and auditor sign-off forms.', initiativeCode: 'EHM-INIT-003', entityCode: 'EHM', department: 'Grants & Governance', targetWeek: 'Week 2 (Days 8–14)', status: 'IN_PROGRESS' },
      { epicCode: 'EHM-EPIC-009', title: 'Corrective Action Plan (CAPA) Manager', description: 'CAPA item tracking with due date escalations and owner assignments.', initiativeCode: 'EHM-INIT-003', entityCode: 'EHM', department: 'Grants & Governance', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // CAG-INIT-004 (3 Epics)
      { epicCode: 'CAG-EPIC-010', title: 'Carbon Credit Tokenization Ledger', description: 'Verra & Gold Standard certificate digital twin registry.', initiativeCode: 'CAG-INIT-004', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 1 (Days 1–7)', status: 'PLANNED' },
      { epicCode: 'CAG-EPIC-011', title: 'Offset Trading Order Book & Clearing', description: 'Peer-to-peer offset purchase order matching and clearinghouse.', initiativeCode: 'CAG-INIT-004', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 2 (Days 8–14)', status: 'PLANNED' },
      { epicCode: 'CAG-EPIC-012', title: 'Carbon Registry Reconciliation Suite', description: 'Automated double-counting audit service and retirement certificate lock.', initiativeCode: 'CAG-INIT-004', entityCode: 'CAG', department: 'Product & Tech', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },

      // EHM-INIT-004 (3 Epics)
      { epicCode: 'EHM-EPIC-010', title: 'DocuSign E-Signature Integration', description: 'Automated contract sending, signing webhook, and archival.', initiativeCode: 'EHM-INIT-004', entityCode: 'EHM', department: 'Sales & Marketing', targetWeek: 'Week 1 (Days 1–7)', status: 'PLANNED' },
      { epicCode: 'EHM-EPIC-011', title: 'Client Portal SLA Health Dashboard', description: 'Real-time SLA status tracker for enterprise account managers.', initiativeCode: 'EHM-INIT-004', entityCode: 'EHM', department: 'Sales & Marketing', targetWeek: 'Week 2 (Days 8–14)', status: 'PLANNED' },
      { epicCode: 'EHM-EPIC-012', title: 'Client Intake & Pre-Qualification Wizard', description: 'Environmental risk assessment questionnaire and automated proposal cost calculator.', initiativeCode: 'EHM-INIT-004', entityCode: 'EHM', department: 'Sales & Marketing', targetWeek: 'Week 3 (Days 15–21)', status: 'PLANNED' },
    ];

    const seededEpicsMap: Record<string, any> = {};

    for (const epData of epicsData) {
      const parentInit = seededInitiativesMap[epData.initiativeCode];
      let [existingEp] = await db.select().from(epics).where(eq(epics.epicCode, epData.epicCode));
      if (!existingEp) {
        try {
          [existingEp] = await db.insert(epics).values({
            epicCode: epData.epicCode,
            title: epData.title,
            description: epData.description,
            initiativeId: parentInit?.id || Object.values(seededInitiativesMap)[0]?.id,
            entityId: seededEntities[epData.entityCode],
            department: epData.department,
            targetWeek: epData.targetWeek,
            sprintsCountTarget: 2,
            status: epData.status,
          }).returning();
          console.log(`[SEED] Epic inserted: ${epData.epicCode}`);
        } catch (err) {
          [existingEp] = await db.select().from(epics).where(eq(epics.epicCode, epData.epicCode));
        }
      } else {
        await db.update(epics).set({
          title: epData.title,
          description: epData.description,
          initiativeId: parentInit?.id || existingEp.initiativeId,
          status: epData.status,
        }).where(eq(epics.id, existingEp.id));
      }
      if (existingEp) {
        seededEpicsMap[epData.epicCode] = existingEp;
      }
    }

    // 6b. Seed / Upsert Active & Planned Sprints
    const sprintsData = [
      { sprintCode: 'CAG-SPR-01', name: 'Sprint 1 - Core Analytics & Auth', entityCode: 'CAG', epicCode: 'CAG-EPIC-001', targetWeek: 'Week 1 (Days 1–7)', goal: 'Deploy core JWT authentication, radial charts, and telemetry pipeline.', status: 'ACTIVE' },
      { sprintCode: 'CAG-SPR-02', name: 'Sprint 2 - AI Scope 3 & ESG Auditing', entityCode: 'CAG', epicCode: 'CAG-EPIC-004', targetWeek: 'Week 2 (Days 8–14)', goal: 'Build supplier onboarding forms, Scope 3 ML predictor, and ESG scorecards.', status: 'ACTIVE' },
      { sprintCode: 'EHM-SPR-01', name: 'Sprint 1 - Client ERP & Timesheets', entityCode: 'EHM', epicCode: 'EHM-EPIC-001', targetWeek: 'Week 1 (Days 1–7)', goal: 'Finalize client project portal, invoice PDF generator, and ISO 14001 evidence vault.', status: 'ACTIVE' },
      { sprintCode: 'EHM-SPR-02', name: 'Sprint 2 - EIA Site Mobile Inspector', entityCode: 'EHM', epicCode: 'EHM-EPIC-004', targetWeek: 'Week 2 (Days 8–14)', goal: 'Complete offline field inspector PWA with GPS photo tagging and GIS layers.', status: 'PLANNED' },
    ];

    const seededSprintsMap: Record<string, any> = {};

    for (const sprData of sprintsData) {
      const parentEp = seededEpicsMap[sprData.epicCode];
      let [existingSpr] = await db.select().from(sprints).where(eq(sprints.sprintCode, sprData.sprintCode));
      if (!existingSpr) {
        try {
          [existingSpr] = await db.insert(sprints).values({
            sprintCode: sprData.sprintCode,
            name: sprData.name,
            entityId: seededEntities[sprData.entityCode],
            departmentId: seededDepts[`${sprData.entityCode}_DEV`] || seededDepts[`${sprData.entityCode}_OPS`],
            employeeId: adminEmployee.id,
            epicId: parentEp?.id,
            reviewingLeadId: adminEmployee.id,
            targetWeek: sprData.targetWeek,
            status: sprData.status as any,
            goal: sprData.goal,
            startDate: new Date(Date.now() - 7 * 86400000),
            endDate: new Date(Date.now() + 7 * 86400000),
          }).returning();
          console.log(`[SEED] Sprint inserted: ${sprData.sprintCode}`);
        } catch (err) {
          [existingSpr] = await db.select().from(sprints).where(eq(sprints.sprintCode, sprData.sprintCode));
        }
      } else {
        await db.update(sprints).set({
          name: sprData.name,
          goal: sprData.goal,
          status: sprData.status as any,
        }).where(eq(sprints.id, existingSpr.id));
      }
      if (existingSpr) {
        seededSprintsMap[sprData.sprintCode] = existingSpr;
      }
    }

    // 7. Seed / Upsert 73 Tasks (3-4 Tasks per Epic + 40+ Tasks across Sprints & Product Backlog)
    const empCAG1 = seededEmployeesMap['CAG-EMP01']?.id || adminEmployee.id;
    const empCAG2 = seededEmployeesMap['CAG-EMP02']?.id || adminEmployee.id;
    const empCAG3 = seededEmployeesMap['CAG-EMP03']?.id || adminEmployee.id;
    const empEHM2 = seededEmployeesMap['EHM-EMP02']?.id || adminEmployee.id;
    const empEHM3 = seededEmployeesMap['EHM-EMP03']?.id || adminEmployee.id;

    const rawTasks = [
      // CAG-INIT-001 (CAG-EPIC-001, 002, 003)
      { code: 'CAG-EMP01-001', title: 'JWT Authentication & Refresh Token Pipeline', epicCode: 'CAG-EPIC-001', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-002', title: 'Multi-tenant RBAC & Environment Compliance Module', epicCode: 'CAG-EPIC-001', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-003', title: 'Dashboard Performance & Analytics Specs', epicCode: 'CAG-EPIC-001', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG2, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-032', title: 'Global Multi-Region Cloud Backup Sync', epicCode: 'CAG-EPIC-001', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },

      { code: 'CAG-EMP01-004', title: 'Scope 1, 2, 3 Emissions Radial Chart Widget', epicCode: 'CAG-EPIC-002', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG3, status: 'IN_PROGRESS', priority: 'URGENT', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-005', title: 'Historical Trend Comparison Line Graph', epicCode: 'CAG-EPIC-002', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG2, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-038', title: 'Carbon Emission Threshold Heatmap Widget', epicCode: 'CAG-EPIC-002', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG3, status: 'IN_PROGRESS', priority: 'HIGH', type: 'SPRINT_TASK' },

      { code: 'CAG-EMP01-006', title: 'Automated Monthly ESG Report Scheduler', epicCode: 'CAG-EPIC-003', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-007', title: 'High-volume CSV Ingestion & Validation Parser', epicCode: 'CAG-EPIC-003', initCode: 'CAG-INIT-001', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG3, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-039', title: 'Scheduled PDF Mailer with Attachment Service', epicCode: 'CAG-EPIC-003', initCode: 'CAG-INIT-001', ent: 'CAG', assignee: empCAG2, status: 'BACKLOG', priority: 'LOW', type: 'BACKLOG' },

      // EHM-INIT-001 (EHM-EPIC-001, 002, 003)
      { code: 'EHM-EMP01-001', title: 'Product Backlog & Tech Architecture Setup', epicCode: 'EHM-EPIC-001', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: adminEmployee.id, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-004', title: 'Client Onboarding & Project Scope Sign-off', epicCode: 'EHM-EPIC-001', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP01-034', title: 'Security Vulnerability Patching & Dependency Audit', epicCode: 'EHM-EPIC-001', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: adminEmployee.id, status: 'DONE', priority: 'URGENT', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP02-005', title: 'Consultant Timesheet Hourly Rate Calculator', epicCode: 'EHM-EPIC-002', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM3, status: 'IN_PROGRESS', priority: 'URGENT', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-006', title: 'Automated Invoice PDF Generation & Email Dispatch', epicCode: 'EHM-EPIC-002', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP03-035', title: 'Database Indexing Optimization for SLA Queries', epicCode: 'EHM-EPIC-002', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM3, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP02-007', title: 'SLA Breach Webhook & Email Notification Engine', epicCode: 'EHM-EPIC-003', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-008', title: 'Client Project Status Portal Summary View', epicCode: 'EHM-EPIC-003', initCode: 'EHM-INIT-001', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-040', title: 'Automated SLA Penalty Alert Webhook Trigger', epicCode: 'EHM-EPIC-003', initCode: 'EHM-INIT-001', ent: 'EHM', assignee: empEHM3, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },

      // CAG-INIT-002 (CAG-EPIC-004, 005, 006)
      { code: 'CAG-EMP02-009', title: 'Vendor Questionnaire Form Builder Interface', epicCode: 'CAG-EPIC-004', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG2, status: 'IN_PROGRESS', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP02-010', title: 'Supplier Encrypted Document Locker Uploads', epicCode: 'CAG-EPIC-004', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG1, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP02-041', title: 'Vendor Self-Service Invitation Token Link', epicCode: 'CAG-EPIC-004', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG2, status: 'IN_PROGRESS', priority: 'HIGH', type: 'SPRINT_TASK' },

      { code: 'CAG-EMP03-005', title: 'AI Carbon Emissions Footprint Algorithm', epicCode: 'CAG-EPIC-005', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG3, status: 'IN_PROGRESS', priority: 'URGENT', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP03-011', title: 'Upstream Transport & Logistics Model Training', epicCode: 'CAG-EPIC-005', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG3, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP03-042', title: 'Scope 3 Data Normalization Pipeline Engine', epicCode: 'CAG-EPIC-005', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG3, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },

      { code: 'CAG-EMP03-012', title: 'GRI & SASB Benchmark Data Ingestion API', epicCode: 'CAG-EPIC-006', initCode: 'CAG-INIT-002', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG2, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP03-043', title: 'Industry Peer Percentile Ranking Engine', epicCode: 'CAG-EPIC-006', initCode: 'CAG-INIT-002', ent: 'CAG', assignee: empCAG2, status: 'BACKLOG', priority: 'LOW', type: 'BACKLOG' },
      { code: 'CAG-EMP03-044', title: 'Executive ESG Overview Dashboard Export', epicCode: 'CAG-EPIC-006', initCode: 'CAG-INIT-002', ent: 'CAG', assignee: empCAG1, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },

      // EHM-INIT-002 (EHM-EPIC-004, 005, 006)
      { code: 'EHM-EMP03-013', title: 'Offline PWA Cache for Inspector Field Photos', epicCode: 'EHM-EPIC-004', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP03-014', title: 'GPS Location Tagging & Site Boundary Check', epicCode: 'EHM-EPIC-004', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM2, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP03-045', title: 'Offline IndexedDB Local Sync Manager', epicCode: 'EHM-EPIC-004', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'IN_PROGRESS', priority: 'HIGH', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP03-015', title: 'Ministry Standard PDF Layout Engine', epicCode: 'EHM-EPIC-005', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'IN_PROGRESS', priority: 'URGENT', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP03-016', title: 'Automated Inspector Digital Signature Placement', epicCode: 'EHM-EPIC-005', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP03-046', title: 'Environmental Appendix Photo Embedder Tool', epicCode: 'EHM-EPIC-005', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP03-017', title: 'Mapbox Vector Tile Layer for Protected Forests', epicCode: 'EHM-EPIC-006', initCode: 'EHM-INIT-002', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP03-047', title: 'Watershed Boundary GeoJSON Renderer', epicCode: 'EHM-EPIC-006', initCode: 'EHM-INIT-002', ent: 'EHM', assignee: empEHM2, status: 'BACKLOG', priority: 'LOW', type: 'BACKLOG' },
      { code: 'EHM-EMP03-048', title: 'Flood Risk Zone Overlay Calculation Module', epicCode: 'EHM-EPIC-006', initCode: 'EHM-INIT-002', ent: 'EHM', assignee: empEHM3, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },

      // CAG-INIT-003 (CAG-EPIC-007, 008, 009)
      { code: 'CAG-EMP01-018', title: 'MQTT Cluster Load Balancer & TLS Handshake', epicCode: 'CAG-EPIC-007', initCode: 'CAG-INIT-003', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'IN_PROGRESS', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-019', title: 'Sensor Payload Deserializer & Time-Series DB Ingest', epicCode: 'CAG-EPIC-007', initCode: 'CAG-INIT-003', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG3, status: 'IN_PROGRESS', priority: 'URGENT', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP03-036', title: 'Automated Load Test Suite with K6 Engine', epicCode: 'CAG-EPIC-007', initCode: 'CAG-INIT-003', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG3, status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'SPRINT_TASK' },

      { code: 'CAG-EMP01-020', title: 'Device Heartbeat Monitor & Ping Health-check', epicCode: 'CAG-EPIC-008', initCode: 'CAG-INIT-003', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-049', title: 'Over-The-Air (OTA) Firmware Upgrade Trigger', epicCode: 'CAG-EPIC-008', initCode: 'CAG-INIT-003', ent: 'CAG', assignee: empCAG1, status: 'BACKLOG', priority: 'HIGH', type: 'BACKLOG' },
      { code: 'CAG-EMP01-050', title: 'Device Provisioning QR Code Generator Tool', epicCode: 'CAG-EPIC-008', initCode: 'CAG-INIT-003', ent: 'CAG', assignee: empCAG2, status: 'BACKLOG', priority: 'LOW', type: 'BACKLOG' },

      { code: 'CAG-EMP01-021', title: 'Spike Anomaly Detection Engine via Rolling StdDev', epicCode: 'CAG-EPIC-009', initCode: 'CAG-INIT-003', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG3, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-051', title: 'PagerDuty & Slack Incident Webhook Connector', epicCode: 'CAG-EPIC-009', initCode: 'CAG-INIT-003', sprCode: 'CAG-SPR-01', ent: 'CAG', assignee: empCAG1, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-052', title: 'Threshold Escalation Rule Configurator Panel', epicCode: 'CAG-EPIC-009', initCode: 'CAG-INIT-003', ent: 'CAG', assignee: empCAG3, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },

      // EHM-INIT-003 (EHM-EPIC-007, 008, 009)
      { code: 'EHM-EMP02-022', title: 'AES-256 Policy Document Encryption Service', epicCode: 'EHM-EPIC-007', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-023', title: 'Auditor Access Token & Temporary Portal Links', epicCode: 'EHM-EPIC-007', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM3, status: 'DONE', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-053', title: 'Audit Evidence Verification Checksum Logger', epicCode: 'EHM-EPIC-007', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'DONE', priority: 'HIGH', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP02-024', title: 'Root Cause 5-Why Interactive Diagram Component', epicCode: 'EHM-EPIC-008', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'IN_PROGRESS', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-025', title: 'NCR Audit Sign-off & PDF Summary Generation', epicCode: 'EHM-EPIC-008', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-054', title: 'NCR Severity Escalation Alert Trigger System', epicCode: 'EHM-EPIC-008', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP02-026', title: 'CAPA Action Item Due Date Escalation Triggers', epicCode: 'EHM-EPIC-009', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-055', title: 'CAPA Re-inspection Scheduling Calendar Widget', epicCode: 'EHM-EPIC-009', initCode: 'EHM-INIT-003', sprCode: 'EHM-SPR-01', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-056', title: 'Management Review Action Tracking Table', epicCode: 'EHM-EPIC-009', initCode: 'EHM-INIT-003', ent: 'EHM', assignee: empEHM2, status: 'BACKLOG', priority: 'LOW', type: 'BACKLOG' },

      // CAG-INIT-004 (CAG-EPIC-010, 011, 012)
      { code: 'CAG-EMP01-027', title: 'Verra Registry API Webhook for Credit Verification', epicCode: 'CAG-EPIC-010', initCode: 'CAG-INIT-004', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG1, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-028', title: 'Gold Standard Serial Number Hash Validation', epicCode: 'CAG-EPIC-010', initCode: 'CAG-INIT-004', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG3, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-057', title: 'Mint Digital Carbon Certificate Token Contract', epicCode: 'CAG-EPIC-010', initCode: 'CAG-INIT-004', ent: 'CAG', assignee: empCAG1, status: 'BACKLOG', priority: 'URGENT', type: 'BACKLOG' },

      { code: 'CAG-EMP01-029', title: 'Offset Purchase Matching Engine & Order Ledger', epicCode: 'CAG-EPIC-011', initCode: 'CAG-INIT-004', sprCode: 'CAG-SPR-02', ent: 'CAG', assignee: empCAG1, status: 'TODO', priority: 'URGENT', type: 'SPRINT_TASK' },
      { code: 'CAG-EMP01-058', title: 'Real-time Carbon Credit Bid-Ask Spread Feed', epicCode: 'CAG-EPIC-011', initCode: 'CAG-INIT-004', ent: 'CAG', assignee: empCAG2, status: 'BACKLOG', priority: 'HIGH', type: 'BACKLOG' },
      { code: 'CAG-EMP01-059', title: 'Multi-Currency Settlement Gateway Integration', epicCode: 'CAG-EPIC-011', initCode: 'CAG-INIT-004', ent: 'CAG', assignee: empCAG1, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },

      { code: 'CAG-EMP01-060', title: 'Automated Double-Counting Audit Service', epicCode: 'CAG-EPIC-012', initCode: 'CAG-INIT-004', ent: 'CAG', assignee: empCAG3, status: 'BACKLOG', priority: 'URGENT', type: 'BACKLOG' },
      { code: 'CAG-EMP01-061', title: 'Voluntary Market Retirement Certificate Lock', epicCode: 'CAG-EPIC-012', initCode: 'CAG-INIT-004', ent: 'CAG', assignee: empCAG1, status: 'BACKLOG', priority: 'HIGH', type: 'BACKLOG' },
      { code: 'CAG-EMP01-062', title: 'Annual Carbon Neutrality Verification Report Generator', epicCode: 'CAG-EPIC-012', initCode: 'CAG-INIT-004', ent: 'CAG', assignee: empCAG2, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },

      // EHM-INIT-004 (EHM-EPIC-010, 011, 012)
      { code: 'EHM-EMP02-030', title: 'DocuSign API Authentication & Template Mapping', epicCode: 'EHM-EPIC-010', initCode: 'EHM-INIT-004', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-037', title: 'Client Onboarding Email Template Redesign', epicCode: 'EHM-EPIC-010', initCode: 'EHM-INIT-004', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'LOW', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-063', title: 'Executed NDA Vault Archival Webhook Service', epicCode: 'EHM-EPIC-010', initCode: 'EHM-INIT-004', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },

      { code: 'EHM-EMP02-031', title: 'Enterprise Account SLA Real-time Health Matrix', epicCode: 'EHM-EPIC-011', initCode: 'EHM-INIT-004', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM3, status: 'TODO', priority: 'MEDIUM', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-064', title: 'Key Client Monthly Deliverable Progress Gauge', epicCode: 'EHM-EPIC-011', initCode: 'EHM-INIT-004', sprCode: 'EHM-SPR-02', ent: 'EHM', assignee: empEHM2, status: 'TODO', priority: 'HIGH', type: 'SPRINT_TASK' },
      { code: 'EHM-EMP02-065', title: 'Executive Account Manager Escalation Button', epicCode: 'EHM-EPIC-011', initCode: 'EHM-INIT-004', ent: 'EHM', assignee: empEHM3, status: 'BACKLOG', priority: 'LOW', type: 'BACKLOG' },

      { code: 'EHM-EMP02-066', title: 'Environmental Risk Assessment Intake Questionnaire', epicCode: 'EHM-EPIC-012', initCode: 'EHM-INIT-004', ent: 'EHM', assignee: empEHM2, status: 'BACKLOG', priority: 'HIGH', type: 'BACKLOG' },
      { code: 'EHM-EMP02-067', title: 'Automated Proposal Cost Calculator Module', epicCode: 'EHM-EPIC-012', initCode: 'EHM-INIT-004', ent: 'EHM', assignee: empEHM3, status: 'BACKLOG', priority: 'HIGH', type: 'BACKLOG' },
      { code: 'EHM-EMP02-068', title: 'Project Scope Sign-Off E-Approval Step', epicCode: 'EHM-EPIC-012', initCode: 'EHM-INIT-004', ent: 'EHM', assignee: empEHM2, status: 'BACKLOG', priority: 'MEDIUM', type: 'BACKLOG' },
    ];

    for (const tsk of rawTasks) {
      const parentInit = seededInitiativesMap[tsk.initCode];
      const parentEp = seededEpicsMap[tsk.epicCode];
      const parentSpr = tsk.sprCode ? seededSprintsMap[tsk.sprCode] : null;

      let [existingTask] = await db.select().from(tasks).where(eq(tasks.taskCode, tsk.code));
      const epicIdVal = parentEp?.id || null;
      const sprintIdVal = parentSpr?.id || null;
      const resolvedType: 'SPRINT_TASK' | 'EPIC_TASK' | 'BACKLOG' = (tsk.type as any) || (parentSpr ? 'SPRINT_TASK' : parentEp ? 'EPIC_TASK' : 'BACKLOG');

      if (!existingTask) {
        try {
          await db.insert(tasks).values({
            taskCode: tsk.code,
            title: tsk.title,
            description: `Deliverable task for ${tsk.title} under epic ${tsk.epicCode}.`,
            entityId: seededEntities[tsk.ent],
            departmentId: seededDepts[`${tsk.ent}_DEV`] || seededDepts[`${tsk.ent}_OPS`],
            assigneeId: tsk.assignee,
            creatorId: adminEmployee.id,
            reviewingLeadId: adminEmployee.id,
            initiativeId: parentInit?.id || parentEp?.initiativeId || null,
            epicId: epicIdVal,
            sprintId: sprintIdVal,
            taskType: resolvedType,
            status: tsk.status as any,
            priority: tsk.priority as any,
            dueDate: new Date(Date.now() + Math.floor(Math.random() * 10 - 3) * 86400000),
          });
          console.log(`[SEED] Task inserted: ${tsk.code}`);
        } catch (err: any) {
          console.error(`[SEED TASK ERR] ${tsk.code}:`, err?.message || err);
        }
      } else {
        await db.update(tasks).set({
          entityId: seededEntities[tsk.ent],
          initiativeId: parentInit?.id || parentEp?.initiativeId || null,
          epicId: epicIdVal,
          sprintId: sprintIdVal,
          taskType: resolvedType,
          status: tsk.status as any,
          priority: tsk.priority as any,
        }).where(eq(tasks.id, existingTask.id));
      }
    }

    // 8. Seed 1 Month (30 Days) of Attendance Records for all employees
    const allEmpsList = Object.values(seededEmployeesMap);
    const nowMs = Date.now();
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const targetDateObj = new Date(nowMs - dayOffset * 86400000);
      const dateStr = targetDateObj.toISOString().split('T')[0];
      const isWeekend = targetDateObj.getDay() === 0 || targetDateObj.getDay() === 6;

      if (isWeekend) continue; // Skip weekends for attendance

      for (let i = 0; i < allEmpsList.length; i++) {
        const emp = allEmpsList[i];
        const [existingAtt] = await db
          .select()
          .from(attendance)
          .where(and(eq(attendance.employeeId, emp.id), eq(attendance.date, dateStr)));

        if (!existingAtt) {
          // Status variation
          let status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' = 'PRESENT';
          if ((dayOffset + i) % 7 === 0) status = 'LATE';
          else if ((dayOffset + i) % 11 === 0) status = 'HALF_DAY';
          else if ((dayOffset + i) % 19 === 0) status = 'ABSENT';

          const workMode: 'IN_OFFICE' | 'REMOTE' | 'HYBRID' = i % 3 === 0 ? 'IN_OFFICE' : i % 3 === 1 ? 'HYBRID' : 'REMOTE';
          const clockInTime = new Date(targetDateObj);
          clockInTime.setHours(9, status === 'LATE' ? 30 : 0, 0);

          const clockOutTime = new Date(targetDateObj);
          clockOutTime.setHours(17, 30, 0);

          await db.insert(attendance).values({
            employeeId: emp.id,
            date: dateStr,
            clockIn: clockInTime,
            clockOut: status === 'ABSENT' ? null : clockOutTime,
            workMode,
            status,
            totalHours: status === 'PRESENT' ? '8.50' : status === 'LATE' ? '8.00' : status === 'HALF_DAY' ? '4.25' : '0.00',
          });
        }
      }
    }
    console.log('[SEED] 30 Days Attendance seeded for all team members!');

    // 9. Seed Live Meetings for Schedule & Calendar
    const meetingSamples = [
      {
        title: 'Sprint Planning & Backlog Review',
        description: 'Review upcoming sprint deliverables, epic targets, and task commitments.',
        startTime: new Date(nowMs + 30 * 60000), // Today in 30 mins
        endTime: new Date(nowMs + 90 * 60000),
        location: 'Google Meet',
        googleMeetUrl: 'https://meet.google.com/abc-defg-hij',
        organizerId: adminEmployee.id,
        invitees: allEmpsList.slice(0, 3).map(e => e.id),
      },
      {
        title: 'Climagro ESG & Carbon Engine Sync',
        description: 'Technical sync on AI carbon algorithm calculation & Scope 3 reporting.',
        startTime: new Date(nowMs + 4 * 3600000), // Today afternoon
        endTime: new Date(nowMs + 5 * 3600000),
        location: 'Google Meet',
        googleMeetUrl: 'https://meet.google.com/cag-esg-sync',
        organizerId: seededEmployeesMap['CAG-EMP01']?.id || adminEmployee.id,
        invitees: allEmpsList.map(e => e.id),
      },
      {
        title: 'Daily Agile Standup & Blockers',
        description: 'Quick 15-min sync on daily progress and blocker resolution.',
        startTime: new Date(nowMs + 24 * 3600000), // Tomorrow morning
        endTime: new Date(nowMs + 24.5 * 3600000),
        location: 'Google Meet',
        googleMeetUrl: 'https://meet.google.com/hros-daily-standup',
        organizerId: adminEmployee.id,
        invitees: allEmpsList.map(e => e.id),
      },
    ];

    for (const m of meetingSamples) {
      const [existingM] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.title, m.title));

      if (!existingM) {
        const [insertedM] = await db.insert(meetings).values({
          title: m.title,
          description: m.description,
          startTime: m.startTime,
          endTime: m.endTime,
          location: m.location,
          googleMeetUrl: m.googleMeetUrl,
          organizerId: m.organizerId,
          invitees: m.invitees,
          source: 'INTERNAL',
          status: 'SCHEDULED',
        }).returning();

        if (m.invitees && m.invitees.length > 0) {
          const rows = m.invitees.map(empId => ({
            meetingId: insertedM.id,
            employeeId: empId,
            responseStatus: 'ACCEPTED' as const,
          }));
          await db.insert(meetingAttendees).values(rows);
        }
      }
    }
    console.log('[SEED] Live Meetings seeded successfully!');

    console.log(`[SEED] Admin Credentials: ${adminEmail} (password: ${adminPassword})`);
    console.log('[SEED] Database seeding complete!');
  } catch (err) {
    console.error('[SEED ERROR] Database seed failure:', err);
  }
}

// Allow direct execution from CLI
if (process.argv.some(a => a.includes('seed'))) {
  runSeed()
    .then(() => {
      console.log('[SEED] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED ERROR]:', err);
      process.exit(1);
    });
}

