import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('C:/hrdashboard');
const OUTPUT_FILE = path.join(ROOT_DIR, 'FULL_CODEBASE_UNABRIDGED.md');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.system_generated',
  '.gemini',
  '.agents',
  'brain',
  '.user_uploaded',
]);

const INCLUDED_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.json',
  '.css',
  '.html',
  '.sql',
  '.env.example',
]);

const EXCLUDED_FILES = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  'FULL_CODEBASE_UNABRIDGED.md',
  '.env',
]);

function getLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
      return 'typescript';
    case '.tsx':
      return 'tsx';
    case '.js':
    case '.mjs':
      return 'javascript';
    case '.jsx':
      return 'jsx';
    case '.json':
      return 'json';
    case '.css':
      return 'css';
    case '.html':
      return 'html';
    case '.sql':
      return 'sql';
    default:
      return '';
  }
}

function scanDir(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        scanDir(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ((INCLUDED_EXTS.has(ext) || entry.name === '.env.example') && !EXCLUDED_FILES.has(entry.name)) {
        if (!relPath.includes('scratch') && !relPath.includes('dist') && !relPath.includes('.cache')) {
          fileList.push(fullPath);
        }
      }
    }
  }

  return fileList;
}

async function generate() {
  console.log('🔍 Scanning files to build FULL_CODEBASE_UNABRIDGED.md...');
  const allFiles = scanDir(ROOT_DIR).sort();
  console.log(`Found ${allFiles.length} source code files.`);

  let content = `# 📦 EHM-CLIMAGRO OS — FULL UNABRIDGED CODEBASE DUMP\n\n`;
  content += `> Generated on: ${new Date().toISOString()}\n`;
  content += `> Total Source Files Included: ${allFiles.length}\n\n`;
  content += `## Table of Contents\n\n`;

  for (const file of allFiles) {
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    content += `- [${rel}](#file-${rel.replace(/[^a-zA-Z0-9_-]/g, '-')})\n`;
  }

  content += `\n---\n\n`;

  for (const file of allFiles) {
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const lang = getLanguage(file);
    const code = fs.readFileSync(file, 'utf-8');

    content += `### File: \`${rel}\`\n\n`;
    content += `\`\`\`${lang}\n${code}\n\`\`\`\n\n---\n\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`✅ FULL_CODEBASE_UNABRIDGED.md updated successfully (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB)`);
}

generate().catch(console.error);
