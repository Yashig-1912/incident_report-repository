import admin from './firebaseConfig.js';
import { readFileSync } from 'fs';

const db = admin.firestore();

async function migrateReports() {
  const reports = JSON.parse(readFileSync('./incident_reports.json', 'utf-8'));
  for (const report of reports) {
    await db.collection('reports').doc(report.code).set(report);
    console.log(`Migrated report: ${report.code}`);
  }
  console.log('All reports migrated!');
}

async function migrateRemarks() {
  try {
    const remarksData = JSON.parse(readFileSync('./remarks.json', 'utf-8'));
    for (const code in remarksData) {
      for (const remark of remarksData[code]) {
        await db.collection('reports').doc(code).collection('remarks').add(remark);
        console.log(`Migrated remark for: ${code}`);
      }
    }
    console.log('All remarks migrated!');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No remarks.json file found, skipping remarks migration.');
    } else {
      throw err;
    }
  }
}

// Run both migrations in order
debugger;
migrateReports().then(migrateRemarks).catch(console.error); 