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
- SQLAlchemy
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
placement-portal/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── tasks/
│   ├── app.py
│   ├── celery_config.py
│   ├── database_config.py
│   └── redis_cache.py
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── router.js
│   └── app.js
│
├── static/
├── templates/
├── requirements.txt
└── README.md
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

The relationships between these tables are managed using SQLAlchemy.

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd placement-portal
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

```bash
celery -A backend.celery_config.celery worker --loglevel=info
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

- Resume upload and parsing
- Interview scheduling
- Notifications inside the application
- Analytics dashboard with charts
- Search and filtering
- Pagination for large datasets
- Role-based permission improvements

---

## Learning Outcomes

While developing this project, I worked with:

- Flask API development
- Vue.js frontend development
- SQLAlchemy ORM
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
