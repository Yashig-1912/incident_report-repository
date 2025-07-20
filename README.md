# Incident Report Platform for Colleges

[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-blue)](https://incident-report-app.onrender.com)

## Live Demo

You can access the live project here:  
[https://incident-report-app.onrender.com](https://incident-report-app.onrender.com)

A full-stack web platform for college students to anonymously report harassment or ragging incidents. Includes admin review, evidence upload, referral codes, complaint tracking, and more.

## Features
- Anonymous incident reporting for students
- Evidence file upload (images, documents)
- Unique complaint code generation and tracking
- Admin dashboard for reviewing, filtering, and updating complaints
- Remarks and status management for each complaint
- Modern, responsive UI for students and admins

## Project Structure
- `incident_server.js` — Node.js/Express backend server
- `incident_public/` — Student-facing frontend (HTML, CSS, JS)
- `incident_admin/` — Admin dashboard frontend
- `evidence/` — Uploaded evidence files
- `incident_reports.json`, `incident_reports.csv` — Stored reports
- `evidence.json`, `remarks.json` — Metadata and remarks

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Git](https://git-scm.com/)

### Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/Yashig-1912/incident_report-repository.git
   cd incident_report-repository
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the server:**
   ```sh
   node incident_server.js
   ```
   The server will start on [http://localhost:3000](http://localhost:3000) by default.

### Usage

- **Entry Point:**  
  Open `http://localhost:3000/incident_public/incident_index.html` in your browser.  
  This page allows students to register or track complaints, and now includes an **Admin Login** button just below the main box (right-aligned) for administrators.

- **Admin Dashboard:**  
  Click the **Admin Login** button on the main page to access the admin dashboard (`incident_admin/admin.html`).

- **Tracking Page:**  
  Students can track complaints directly from the main page.

### File Uploads
- Evidence files are stored in the `evidence/` directory.
- Metadata is managed in `evidence.json`.

### Data Storage
- Complaints are stored in `incident_reports.json` and `incident_reports.csv`.
- Remarks are stored in `remarks.json`.

## Deployment
- To make your site public, deploy the project to a Node.js hosting platform (e.g., Render, Railway, Heroku).
- Update the server port and environment variables as needed for your host.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is for educational purposes. 