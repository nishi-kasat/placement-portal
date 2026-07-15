from celery_config import celery_app
from database_config import get_database_connection
from datetime import datetime
import os
import smtplib
from email.message import EmailMessage
import json
import urllib.request

def send_gchat_message(webhook_url, text_message):
    try:
        data = json.dumps({"text": text_message}).encode("utf-8")
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to send G-Chat message: {e}")

@celery_app.task
def send_daily_reminders():
    connection = get_database_connection()
    cursor = connection.cursor()

    today = datetime.now().strftime("%Y-%m-%d")

    cursor.execute("""
        SELECT student.full_name, placement_drive.job_title, placement_drive.application_deadline
        FROM placement_drive
        JOIN application ON placement_drive.drive_id = application.drive_id
        JOIN student ON application.student_id = student.student_id
        WHERE date(placement_drive.application_deadline) = date(?)
    """, (today,))

    reminders = cursor.fetchall()

    for r in reminders:
        message = f"Reminder: {r['full_name']} apply for {r['job_title']} today"
        
        gchat_webhook = os.environ.get('GCHAT_WEBHOOK_URL')
        if gchat_webhook:
            send_gchat_message(gchat_webhook, message)
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = os.environ.get('SMTP_PORT')
        smtp_user = os.environ.get('SMTP_USER')
        smtp_pass = os.environ.get('SMTP_PASS')
        admin_email = os.environ.get('ADMIN_EMAIL')

        if smtp_host and smtp_port and smtp_user and smtp_pass and admin_email:
            try:
                msg = EmailMessage()
                msg['Subject'] = 'Placement Portal: Deadline Reminder'
                msg['From'] = smtp_user
                msg['To'] = admin_email
                msg.set_content(message)

                with smtplib.SMTP_SSL(smtp_host, int(smtp_port)) as server:
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
            except Exception:
                print(message)
        else:
            print(message)

    connection.close()