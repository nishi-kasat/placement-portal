# Placement Portal

A web-based Placement Portal developed to simplify the campus recruitment process for students, companies, and placement administrators. The application provides separate dashboards for each user role and supports managing placement drives, applications, and student records from a single platform.

This project was developed using Flask for the backend, Vue.js for the frontend, SQLite for the database, Redis for caching, and Celery for background tasks.

---

## Features

### Administrator
- Secure login
- Dashboard with placement statistics
- Manage students
- Manage companies
- Create, edit, and delete placement drives
- View applications
- Cache dashboard statistics using Redis

### Student
- Register and login
- Update profile
- Browse available placement drives
- Apply for placement drives
- Track application status
- Export application history as a CSV file

### Company
- Login
- View eligible students
- Manage placement drives
- View applications received
- Update application status

---

## Technologies Used

### Backend
- Flask
- Flask Session
- SQLite
- Redis
- Celery

### Frontend
- Vue.js
- Vue Router
- Bootstrap 5
- JavaScript
- HTML
- CSS

### Background Tasks
- Celery
- Redis
- SMTP Email

---

## Project Structure

```
ppa/
├── backend/
│   ├── routes/              # Flask API blueprints (auth, user, student, company, admin)
│   ├── tasks/               # Celery async and periodic tasks (Reminders, Reports, CSVs)
│   ├── app.py               # Main Flask application entry point
│   ├── celery_config.py     # Celery and Beat configuration
│   ├── database_config.py   # DB schemas & database initialization script
│   └── redis_cache.py       # Caching functions and helpers
├── frontend/
│   ├── css/
│   │   └── styles.css       # Unified custom dark glassmorphic stylesheet
│   ├── js/
│   │   ├── layout/          # Vue layout components (AppLayout.js)
│   │   ├── services/        # API request utility scripts (api.js)
│   │   ├── store/           # Central reactive state storage (sessionStore.js)
│   │   ├── pages/           # Dedicated JS modules representing Vue views/pages
│   │   ├── router.js        # Vue Router page navigation mappings
│   │   └── app.js           # Root Vue component initialization & mounting
│   └── templates/
│       └── index.html       # HTML Entry point serving CDNs and templates
├── requirements.txt         # Project python dependencies
└── README.md                # Project documentation
```

---

## User Roles

The application supports three user roles.

### Administrator

- Manage students
- Manage companies
- Manage placement drives
- View placement statistics
- Monitor applications

### Student

- Complete profile
- Apply for placement drives
- Track application status
- Export application history

### Company

- Create placement drives
- View applicants
- Update application status

---

## Background Tasks

Celery is used to execute tasks asynchronously.

Implemented tasks include:

- Exporting application data
- Sending reminder emails
- Generating monthly reports

Redis is used as the Celery broker and also for caching frequently accessed dashboard data.

---

## Database

The application uses SQLite.

Main tables include:

- Users
- Students
- Companies
- Placement Drives
- Applications

The relationships between these tables are managed using raw SQL queries and SQLite foreign key constraints.

---

## Installation

### Extract and navigate to the folder

```bash
cd ppa
```

### Create a virtual environment

```bash
python -m venv venv
```

Activate the environment.

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start Redis

```bash
redis-server
```

### Start Celery

**Windows PowerShell**:
```powershell
$env:PYTHONPATH="backend"
celery -A backend.celery_config.celery_app worker --loglevel=info -P solo
```

**Linux/macOS**:
```bash
PYTHONPATH=backend celery -A backend.celery_config.celery_app worker --loglevel=info
```

### Run the application

```bash
python backend/app.py
```

Open the application in your browser:

```
http://localhost:5000
```

---

## Future Improvements

Some features that can be added in the future include:

- Automated resume parsing and ATS matching
- In-app notification feed (bell icon alerts)
- Interactive graphical charts (e.g. using ChartJS) for placement statistics
- Pagination for large datasets in admin tables

---

## Learning Outcomes

While developing this project, I worked with:

- Flask API development
- Vue.js frontend development
- SQLite & raw SQL database management
- Database relationships
- Redis caching
- Celery background tasks
- Session-based authentication
- REST API design
- CRUD operations
- Asynchronous task processing

---

## Author

**Nishi Kasat**