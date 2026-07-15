from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "placement_portal",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=[
        "tasks.daily_reminder_task",
        "tasks.monthly_report_task",
        "tasks.export_csv_task"
    ]
)

celery_app.conf.timezone = "Asia/Kolkata"

celery_app.conf.beat_schedule = {
    "daily_reminder_job": {
        "task": "tasks.daily_reminder_task.send_daily_reminders",
        "schedule": 86400.0
    },
    "monthly_report_job": {
        "task": "tasks.monthly_report_task.generate_monthly_report",
        "schedule": crontab(minute=0, hour=0, day_of_month='1')
    }
}