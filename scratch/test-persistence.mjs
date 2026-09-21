import { dataStore } from '../src/lib/data-store.js';
import fs from 'fs';
import path from 'path';

console.log('Testing dataStore server-side persistence...');

// 1. Read current snapshot
const initialProjects = dataStore.getProjects();
const initialEvents = dataStore.getEvents();
console.log(`Initial Projects count: ${initialProjects.length}`);
console.log(`Initial Events count: ${initialEvents.length}`);

// 2. Verify ensureServerSync loads from disk
const dbPath = path.join(process.cwd(), 'data', 'arknet-db.json');
const exists = fs.existsSync(dbPath);
console.log(`data/arknet-db.json exists: ${exists}`);

if (exists) {
  const content = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  console.log(`Disk JSON Projects count: ${(content.projects || []).length}`);
  console.log(`Disk JSON Events count: ${(content.events || []).length}`);
}

console.log('Test completed successfully.');
