import express from 'express';
import { existsSync, readFileSync, writeFileSync, createWriteStream, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import path from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
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
import multer from 'multer';
const evidenceDir = join(__dirname, 'evidence');
if (!existsSync(evidenceDir)) mkdirSync(evidenceDir);
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, evidenceDir),
    filename: (req, file, cb) => {
        // Use code + original extension
        // If code is not present, generate a temp one (will be replaced after report is saved)
        let code = req.body.code || 'evidence-' + Date.now();
        cb(null, code + extname(file.originalname));
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

// Store reports in a JSON file
const REPORTS_FILE = join(__dirname, 'incident_reports.json');
const EVIDENCE_FILE = join(__dirname, 'evidence.json');
const REMARKS_FILE = join(__dirname, 'remarks.json');

// Helper to read/write reports (JSON)
function getReports() {
    if (!existsSync(REPORTS_FILE)) return [];
    return JSON.parse(readFileSync(REPORTS_FILE));
}
function saveReport(report) {
    const reports = getReports();
    reports.push(report);
    writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
}

function saveEvidenceInfo(code, type, filename) {
    let evidences = [];
    if (existsSync(EVIDENCE_FILE)) evidences = JSON.parse(readFileSync(EVIDENCE_FILE));
    evidences.push({ code, type, filename });
    writeFileSync(EVIDENCE_FILE, JSON.stringify(evidences, null, 2));
}

function generateCode() {
    return 'XYZ-' + Date.now().toString(36).toUpperCase();
}

// API: Submit a report (with evidence upload)
app.post('/api/report', upload.single('evidence'), async (req, res) => {
    try {
        // Set 'None' for any optional fields if not provided
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
        const code = generateCode();
        let evidenceType = '';
        let evidenceFilename = '';
        if (req.file) {
            evidenceType = req.file.mimetype.split('/')[0];
            // Rename file to use the generated code
            const newFilename = code + extname(req.file.originalname);
            const fs = await import('fs/promises');
            await fs.rename(req.file.path, join(evidenceDir, newFilename));
            evidenceFilename = newFilename;
            saveEvidenceInfo(code, evidenceType, evidenceFilename);
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
        saveReport(report);
        res.json({ message: 'Report submitted successfully.', code });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

// API: Admin login
const ADMIN_PASSWORD = 'admin123'; // Change this if needed
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// API: Get all reports (admin)
app.get('/api/admin/reports', (req, res) => {
    // In production, add real authentication!
    res.json(getReports());
});

// API: Update seriousness by code
app.post('/api/admin/seriousness', (req, res) => {
    const { code, seriousness } = req.body;
    if (!code || !seriousness) return res.status(400).json({ message: 'Code and seriousness required.' });
    const reports = getReports();
    const idx = reports.findIndex(r => r.code === code);
    if (idx === -1) return res.status(404).json({ message: 'Report not found.' });
    reports[idx].seriousness = seriousness;
    writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
    res.json({ message: 'Seriousness updated.' });
});

function getRemarks(code) {
    if (!existsSync(REMARKS_FILE)) return [];
    const all = JSON.parse(readFileSync(REMARKS_FILE));
    return all[code] || [];
}
function addRemark(code, text, who) {
    let all = {};
    if (existsSync(REMARKS_FILE)) all = JSON.parse(readFileSync(REMARKS_FILE));
    if (!all[code]) all[code] = [];
    all[code].push({ text, who, timestamp: new Date().toISOString() });
    writeFileSync(REMARKS_FILE, JSON.stringify(all, null, 2));
}

// GET /api/track/:code - fetch complaint, evidence, remarks
app.get('/api/track/:code', (req, res) => {
    const code = req.params.code;
    const reports = getReports();
    const complaint = reports.find(r => r.code === code);
    if (!complaint) {
        console.log('TRACK DEBUG: code not found:', code, '| Available codes:', reports.map(r => r.code));
        return res.status(404).json({ message: 'Complaint not found.' });
    }
    let evidence = null;
    if (existsSync(EVIDENCE_FILE)) {
        const allEvid = JSON.parse(readFileSync(EVIDENCE_FILE));
        evidence = allEvid.find(e => e.code === code) || null;
    }
    const remarks = getRemarks(code);
    res.json({ complaint, evidence, remarks });
});

// POST /api/track/remark - add a remark
app.post('/api/track/remark', express.json(), (req, res) => {
    const { code, text, who } = req.body;
    if (!code || !text || !who) return res.status(400).json({ message: 'Missing fields.' });
    addRemark(code, text, who);
    res.json({ message: 'Remark added.' });
});

// POST /api/track/status - update status (admin only)
app.post('/api/track/status', express.json(), (req, res) => {
    const { code, status } = req.body;
    if (!code || !status) return res.status(400).json({ message: 'Missing fields.' });
    const reports = getReports();
    const idx = reports.findIndex(r => r.code === code);
    if (idx === -1) return res.status(404).json({ message: 'Complaint not found.' });
    reports[idx].status = status;
    writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
    res.json({ message: 'Status updated.' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Static server running on http://localhost:${PORT}`)); 