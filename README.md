#  SmartPlacement — Placement Portal Application

SmartPlacement is a modern, high-performance web application designed for educational institutes to manage, streamline, and track campus recruitment processes. It eliminates manual spreadsheet tracking by introducing a role-based workflow for **Placement Admins**, **Companies**, and **Students**.

Built with a premium dark glassmorphic design theme, the app offers responsive layouts, real-time caching, and background task pipelines for reports and reminders.

---

##  Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend API** | **Flask (Python 3.11+)** | Light and fast RESTful API structure with blueprints. |
| **Frontend UI** | **Vue.js 3 (CDN) & Bootstrap 5** | Responsive layout featuring glassmorphism, smooth animations, and custom dark cards. |
| **Database** | **SQLite** | Programmatically initialized relational database with foreign key support. |
| **Caching** | **Redis** | In-memory key-value cache for dashboard optimization and performance. |
| **Batch Processing** | **Celery & Redis** | Asynchronous task queue for CSV generation and automated cron reports. |

---

##  Roles & Features

###  1. Admin (Institute Placement Cell)
* **Pre-existing Superuser**: Programmatically generated on database initialization (`Username: Administrator / Password: Nishi_PPA`).
* **Approval Pipeline**: Approve/reject company signups and placement drive listings.
* **Control Center**: Manage active students, registered companies, and search across entries.
* **Blacklist System**: Instant option to deactivate/blacklist students or companies.
* **Dashboard Analytics**: Real-time counters showing total students, approved companies, and drive stats.

###  2. Company Representative
* **Interactive Signups**: Self-register company profile with HR details and website.
* **Drive Management**: Create new placement drives specifying eligibility (CGPA, branch, graduation year) and deadlines.
* **Applicant Actions**: Track and view student applications, shortlist candidates, specify interview slots/details, and mark final selection status.
* **Drive Closure**: Option to close drives (either active or pending approval) to prevent new applications.

###  3. Student Candidate
* **Profile Management**: Register, fill academic info (CGPA, Branch, Graduation Year), and upload resume.
* **Opportunity Feed**: View only admin-approved placement drives that the student is eligible for.
* **Job Application**: Apply for target drives with strict front-end and back-end eligibility checks.
* **Export Action**: Request asynchronous CSV exports of entire application history.

---

##  Project Structure

```
ppa/
├── backend/
│   ├── routes/              # Flask API blueprints (auth, student, company, admin)
│   ├── tasks/               # Celery async and periodic tasks (Reminders, Reports, CSVs)
│   ├── app.py               # Main Flask application entry point
│   ├── celery_config.py     # Celery and Beat configuration
│   ├── database_config.py   # DB schemas & database initialization script
│   └── redis_cache.py       # Caching functions and helpers
├── frontend/
│   ├── css/
│   │   └── styles.css       # Unified custom dark glassmorphic stylesheet
│   ├── js/
│   │   ├── api.js           # API fetch helpers (handles credentials/JSON parsing)
│   │   ├── app.js           # Routing and root Vue component configuration
│   │   └── pages/           # Dedicated JS modules representing Vue views/pages
│   └── templates/
│       └── index.html       # HTML Entry point serving CDNs and templates
├── requirements.txt         # Project python dependencies
└── README.md                # Project documentation
```

---

##  Local Setup & Run Guide

### Prerequisite Checklist
* Install **Python 3.11+**
* Install **Redis Server** (listening on `localhost:6379`)

---

### Step 1: Clone & Configure Virtual Environment

1. Navigate to the project root directory:
   ```bash
   cd "C:\Users\Nishi\Documents\Nishi MAD2\ppa"
   ```

2. Initialize a Python virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   * **Windows PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **Linux/macOS Bash**:
     ```bash
     source .venv/bin/activate
     ```

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

---

### Step 2: Start Redis Server
Ensure Redis is running locally. On Windows, you can start it using WSL, Docker, or the native Windows port:
```bash
# Verify connection
redis-cli ping
# Output should return PONG
```

---

### Step 3: Run the Flask Web Application
Run the Flask server. On launch, it will programmatically create the database, tables, and seed the superuser if not already present.
```bash
python backend/app.py
```
The server will start on `http://127.0.0.1:5000`.

---

### Step 4: Start Celery Workers and Beat Scheduler
Open two separate terminals with the virtual environment activated to run background operations:

1. **Start Celery Worker (Processes Tasks)**:
   ```bash
   # From root folder
   celery -A backend.celery_config.celery_app worker --loglevel=info
   ```

2. **Start Celery Beat (Schedules Cron Jobs)**:
   ```bash
   # From root folder
   celery -A backend.celery_config.celery_app beat --loglevel=info
   ```

---

##  Caching & Background Jobs

### Caching Strategy
* **Redis Cache**: API endpoints like the Admin Dashboard utilize redis caching (`get_cache`/`set_cache`).
* **Cache Invalidation**: Whenever a change occurs (e.g. deactivating a student, approving/rejecting a drive, updating a profile), the relevant cache key is instantly invalidated so the frontend remains up to date.

### Background & Periodic Tasks
1. **Daily Application Deadlines Reminder (`tasks/daily_reminder_task.py`)**: Runs daily to fetch students with upcoming application deadlines and notifies them.
2. **Monthly Activity Report (`tasks/monthly_report_task.py`)**: Fires on the 1st of every month to compile placements metrics (applied vs selected, drives conducted) into an HTML template and logs/emails it.
3. **Async CSV Export (`tasks/export_csv_task.py`)**: Triggered on-demand by students. Exports their personal placement application history into a downloadable CSV file.
