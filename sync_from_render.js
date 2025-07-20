import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const RENDER_EXPORT_URL = 'https://incident-report-app.onrender.com/api/export-reports';
const LOCAL_FILE = './incident_reports.json';

async function syncReports() {
  try {
    const res = await fetch(RENDER_EXPORT_URL);
    if (!res.ok) {
      console.error('Failed to fetch from Render:', res.statusText);
      process.exit(1);
    }
    const data = await res.json();
    writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
    console.log('incident_reports.json updated from Render!');
  } catch (err) {
    console.error('Error syncing reports:', err);
    process.exit(1);
  }
}

syncReports(); 