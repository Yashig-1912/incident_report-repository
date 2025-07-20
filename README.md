# Incident Report Platform for Colleges

[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-blue)](https://incident-report-app.onrender.com)

## Live Demo

You can access the live project here:  
[https://incident-report-app.onrender.com](https://incident-report-app.onrender.com)

---

## Overview
A full-stack web platform for college students to anonymously report harassment or ragging incidents. Includes admin review, evidence upload, unique complaint codes, complaint tracking, and more.

---

## Tech Stack
- **Backend:** Node.js (Express, ES modules)
- **Database:** Firebase Firestore (all complaints and remarks)
- **Evidence Storage:** Local server folder (`/evidence`)
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Render (Node.js web service)

---

## Features
- Anonymous complaint submission
- Evidence upload (files stored locally)
- Admin dashboard (filter, search, update status/seriousness)
- Complaint tracking and remarks
- Unique complaint codes
- Firebase Firestore for all structured data
- Local evidence serving (with clear production limitations)

---

## Firebase Integration
- All complaints and remarks are stored in Firestore.
- Requires a `serviceAccountKey.json` file (not committed to git; see .gitignore).
- **Evidence files are stored locally** due to Firebase Storage requiring billing. In production, use a cloud storage provider (Firebase Storage, AWS S3, etc.) for persistence.

### Setting up Firebase
1. Create a Firebase project and enable Firestore.
2. Download your service account key and save as `serviceAccountKey.json` in the project root.
3. In `firebaseConfig.js`, ensure you use:
   ```js
   import admin from 'firebase-admin';
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
   const serviceAccount = require('./serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
     // storageBucket: 'your-bucket.appspot.com' // Only if using Firebase Storage
   });
   export default admin;
   ```

---

## Data Migration
- Use `migrate_to_firestore.js` to migrate old complaints and remarks from `.json` files to Firestore.
- Evidence migration to cloud storage is not supported without billing; files remain local.

---

## Local Evidence Storage
- Evidence files are uploaded to and served from the `/evidence` folder.
- Files are accessible at `/evidence/filename.ext`.
- **Limitation:** On cloud hosts like Render, files may be lost on redeploy. For production, use a persistent cloud storage solution.

---

## Running Locally
1. Install dependencies:
   ```sh
   npm install
   ```
2. Place your `serviceAccountKey.json` in the project root.
3. Start the server:
   ```sh
   node incident_server.js
   ```
4. Access the frontend at [http://localhost:3001](http://localhost:3001)

---

## Deployment (Render)
- Push your code to GitHub.
- Add `serviceAccountKey.json` as a Secret File in Render.
- Deploy as a Node.js web service.
- Evidence files will be stored locally on the Render instance (not persistent).

---

## Limitations & Recommendations
- **Evidence files are not persistent on Render.**
- **Firebase Storage requires billing; not used in this project.**
- For production, migrate evidence to a cloud storage provider.
- Clearly document this limitation in your project report.

---

## Security
- `serviceAccountKey.json` is in `.gitignore` and must never be committed.
- For production, set proper Firestore security rules.

---

## License
MIT 