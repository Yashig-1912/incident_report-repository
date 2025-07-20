import admin from './firebaseConfig.js';
const db = admin.firestore();

// Get all reports
async function getReports() {
  const snapshot = await db.collection('reports').get();
  return snapshot.docs.map(doc => doc.data());
}

// Get a single report by code
async function getReportByCode(code) {
  const doc = await db.collection('reports').doc(code).get();
  return doc.exists ? doc.data() : null;
}

// Save a new report
async function saveReport(report) {
  await db.collection('reports').doc(report.code).set(report);
}

// Update seriousness
async function updateSeriousness(code, seriousness) {
  await db.collection('reports').doc(code).update({ seriousness });
}

// Update status
async function updateStatus(code, status) {
  await db.collection('reports').doc(code).update({ status });
}

// Remarks (as subcollection)
async function getRemarks(code) {
  const snapshot = await db.collection('reports').doc(code).collection('remarks').get();
  return snapshot.docs.map(doc => doc.data());
}

async function addRemark(code, text, who) {
  await db.collection('reports').doc(code).collection('remarks').add({
    text,
    who,
    timestamp: new Date().toISOString()
  });
}

export {
  getReports,
  getReportByCode,
  saveReport,
  updateSeriousness,
  updateStatus,
  getRemarks,
  addRemark
}; 