const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const {
  getReports,
  getReportByCode,
  saveReport,
  updateSeriousness,
  updateStatus,
  getRemarks,
  addRemark
} = require('./firestoreHelpers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
console.log('Project root:', __dirname);
console.log('Serving incident_public from:', path.join(__dirname, 'incident-report-frontend', 'incident_public'));
console.log('Serving incident_admin from:', path.join(__dirname, 'incident-report-frontend', 'incident_admin'));
// Serve all static files from the root of incident-report-frontend
app.use(express.static(path.join(__dirname, 'incident-report-frontend')));

// Redirect root to incident_index.html
app.get('/', (req, res) => {
  res.redirect('/incident_index.html');
});

// Evidence upload support
const evidenceDir = path.join(__dirname, 'evidence');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, evidenceDir),
    filename: (req, file, cb) => {
        // Use code + original extension
        // If code is not present, generate a temp one (will be replaced after report is saved)
        let code = req.body.code || 'evidence-' + Date.now();
        cb(null, code + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/', 'video/', 'audio/', 'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowed.some(type => file.mimetype.startsWith(type))) cb(null, true);
        else cb(new Error('Invalid file type'));
    }
});

// Submit a report
app.post('/api/report', upload.single('evidence'), async (req, res) => {
  try {
    const {
      college = 'None',
      type,
      description,
      date = 'None',
      time = 'None',
      location = 'None',
      accused = 'None',
      evidenceDesc = 'None',
      studentDetails = 'None'
    } = req.body;
    if (!type || !description) {
      return res.status(400).json({ message: 'Type and description required.' });
    }
    const code = 'XYZ-' + Date.now().toString(36).toUpperCase();
    let evidenceType = '';
    let evidenceFilename = '';
    if (req.file) {
      evidenceType = req.file.mimetype.split('/')[0];
      // Rename file to use the generated code
      const newFilename = code + path.extname(req.file.originalname);
      const fs = await import('fs/promises');
      await fs.rename(req.file.path, path.join(evidenceDir, newFilename));
      evidenceFilename = newFilename;
    }
    const report = {
      code,
      college,
      type,
      description,
      date,
      time,
      location,
      accused,
      evidenceDesc,
      studentDetails,
      seriousness: 'Medium',
      status: 'Active',
      timestamp: new Date().toISOString()
    };
    await saveReport(report);
    res.json({ message: 'Report submitted successfully.', code });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Admin login
const ADMIN_PASSWORD = 'admin123';
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Get all reports
app.get('/api/admin/reports', async (req, res) => {
  const reports = await getReports();
  res.json(reports);
});

// Update seriousness
app.post('/api/admin/seriousness', async (req, res) => {
  const { code, seriousness } = req.body;
  if (!code || !seriousness) return res.status(400).json({ message: 'Code and seriousness required.' });
  await updateSeriousness(code, seriousness);
  res.json({ message: 'Seriousness updated.' });
});

// Track complaint by code
app.get('/api/track/:code', async (req, res) => {
  const code = req.params.code;
  const complaint = await getReportByCode(code);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
  const remarks = await getRemarks(code);
  res.json({ complaint, evidence: null, remarks }); // Add evidence logic if needed
});

// Add a remark
app.post('/api/track/remark', async (req, res) => {
  const { code, text, who } = req.body;
  if (!code || !text || !who) return res.status(400).json({ message: 'Missing fields.' });
  await addRemark(code, text, who);
  res.json({ message: 'Remark added.' });
});

// Update status
app.post('/api/track/status', async (req, res) => {
  const { code, status } = req.body;
  if (!code || !status) return res.status(400).json({ message: 'Missing fields.' });
  await updateStatus(code, status);
  res.json({ message: 'Status updated.' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`)); 