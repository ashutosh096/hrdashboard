import { db, epics, projects, employees } from '@workspace/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUUID(str: any): boolean {
  if (typeof str !== 'string') return false;
  return UUID_REGEX.test(str.trim());
}

async function prepareMigration() {
  const allEmps = await db.select().from(employees);
  
  // Build lookup map for exact full name: `${firstName} ${lastName}`.trim()
  const nameToEmpsMap = new Map<string, any[]>();
  for (const emp of allEmps) {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    if (!nameToEmpsMap.has(fullName)) {
      nameToEmpsMap.set(fullName, []);
    }
    nameToEmpsMap.get(fullName)!.push(emp);
  }

  // Find all distinct names in Epics and Projects
  const allEpics = await db.select().from(epics);
  const allProjects = await db.select().from(projects);

  const foundNames = new Set<string>();

  for (const e of allEpics) {
    if (e.assignedTo) {
      let parsed = e.assignedTo;
      try {
        parsed = JSON.parse(e.assignedTo);
      } catch {}
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && !isUUID(item)) foundNames.add(item.trim());
        }
      } else if (typeof parsed === 'string' && !isUUID(parsed)) {
        foundNames.add(parsed.trim());
      }
    }
  }

  for (const p of allProjects) {
    if (p.lead && !isUUID(p.lead)) {
      foundNames.add(p.lead.trim());
    }
    if (Array.isArray(p.team)) {
      for (const m of p.team) {
        if (m && !isUUID(m)) foundNames.add(m.trim());
      }
    }
  }

  console.log('=== DISTINCT NAMES FOUND IN PERSON FIELDS ===');
  const distinctNames = Array.from(foundNames);
  console.log(`Total distinct names: ${distinctNames.length}\n`);

  const zeroMatches: string[] = [];
  const multipleMatches: { name: string; count: number; matches: any[] }[] = [];
  const singleMatches: { name: string; empId: string; email: string }[] = [];

  for (const name of distinctNames) {
    const matches = nameToEmpsMap.get(name) || [];
    if (matches.length === 0) {
      zeroMatches.push(name);
    } else if (matches.length > 1) {
      multipleMatches.push({
        name,
        count: matches.length,
        matches: matches.map(m => ({ id: m.id, code: m.employeeCode, email: m.email })),
      });
    } else {
      singleMatches.push({
        name,
        empId: matches[0].id,
        email: matches[0].email,
      });
    }
  }

  console.log('1. NAMES MATCHING EXACTLY ONE EMPLOYEE:');
  console.table(singleMatches);

  console.log('\n2. NAMES MATCHING ZERO EMPLOYEES:');
  if (zeroMatches.length === 0) {
    console.log('None (0 names)');
  } else {
    console.table(zeroMatches);
  }

  console.log('\n3. NAMES MATCHING MORE THAN ONE EMPLOYEE:');
  if (multipleMatches.length === 0) {
    console.log('None (0 names)');
  } else {
    console.table(multipleMatches);
  }

  process.exit(0);
}

prepareMigration().catch(e => {
  console.error(e);
  process.exit(1);
});
