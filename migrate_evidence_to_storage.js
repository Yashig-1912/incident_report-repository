import admin from './firebaseConfig.js';
import { readdirSync } from 'fs';
import path from 'path';

const db = admin.firestore();
const bucket = admin.storage().bucket();

const evidenceDir = path.join(process.cwd(), 'evidence');

async function migrateEvidence() {
  const files = readdirSync(evidenceDir);
  for (const file of files) {
    const localPath = path.join(evidenceDir, file);
    const dest = `evidence/${file}`;
    // Upload to Firebase Storage
    await bucket.upload(localPath, { destination: dest });
    // Make file public
    const fileRef = bucket.file(dest);
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${dest}`;
    // Extract complaint code from filename (before first dot or full filename if no dot)
    const code = file.split('.')[0];
    // Update Firestore: add evidenceUrl to the report
    const reportRef = db.collection('reports').doc(code);
    await reportRef.update({ evidenceUrl: publicUrl });
    console.log(`Uploaded and linked evidence for: ${code}`);
  }
  console.log('All evidence files migrated!');
}

migrateEvidence().catch(console.error); 