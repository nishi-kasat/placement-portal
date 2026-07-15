from celery_config import celery_app
from database_config import get_database_connection
import csv
import os
import smtplib
from email.message import EmailMessage

@celery_app.task
def export_applications_csv(student_id):
    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT student.student_id,
               company.company_name,
               placement_drive.job_title,
               application.status,
               application.application_date
        FROM application
        JOIN placement_drive ON application.drive_id = placement_drive.drive_id
        JOIN company ON placement_drive.company_id = company.company_id
        JOIN student ON application.student_id = student.student_id
        WHERE student.student_id = ?
    """, (student_id,))

    data = cursor.fetchall()

    file_name = f"student_{student_id}_applications.csv"

    with open(file_name, "w", newline="") as file:
        writer = csv.writer(file)

        writer.writerow([
            "student_id",
            "company_name",
            "job_title",
            "status",
            "application_date"
        ])

        for row in data:
            writer.writerow([
                row["student_id"],
                row["company_name"],
                row["job_title"],
                row["status"],
                row["application_date"]
            ])

    connection.close()

    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = os.environ.get('SMTP_PORT')
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')

    connection = get_database_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT email_id FROM student WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    connection.close()

    recipient = row['email_id'] if row else None

    if smtp_host and smtp_port and smtp_user and smtp_pass and recipient and '@' in recipient:
        try:
            msg = EmailMessage()
            msg['Subject'] = 'Your Placement Applications CSV'
            msg['From'] = smtp_user
            msg['To'] = recipient
            msg.set_content('Please find attached your applications CSV.')

            with open(file_name, 'rb') as f:
                csvdata = f.read()
            msg.add_attachment(csvdata, maintype='text', subtype='csv', filename=file_name)

            with smtplib.SMTP_SSL(smtp_host, int(smtp_port)) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        except Exception:
            print(f"CSV export completed: {file_name}")
    else:
        print(f"CSV export completed: {file_name}")

    return file_name