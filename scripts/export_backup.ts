import { db, epics, projects } from '@workspace/db';
import * as fs from 'fs';
import * as path from 'path';

async function backup() {
  const allEpics = await db.select().from(epics);
  const allProjects = await db.select().from(projects);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = 'C:\\Users\\ashut\\backups';
  const filePath = path.join(backupDir, `backup_epics_projects_${timestamp}.json`);

  const data = {
    timestamp: new Date().toISOString(),
    epicsCount: allEpics.length,
    projectsCount: allProjects.length,
    epics: allEpics,
    projects: allProjects,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`=== BACKUP COMPLETED ===`);
  console.log(`File Path: ${filePath}`);
  console.log(`Epics Row Count: ${allEpics.length}`);
  console.log(`Projects Row Count: ${allProjects.length}`);
}

backup().catch(e => {
  console.error('Backup failed:', e);
  process.exit(1);
});
