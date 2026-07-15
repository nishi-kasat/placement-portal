from celery_config import celery_app
from database_config import get_database_connection
import os
import smtplib
from email.message import EmailMessage

@celery_app.task
def generate_monthly_report():
    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM placement_drive")
    total_drives = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM application")
    total_applications = cursor.fetchone()["count"]

    cursor.execute("""
        SELECT COUNT(*) as count FROM application WHERE status = 'selected'
    """)
    total_selected = cursor.fetchone()["count"]

    report = f"""
    Monthly Report:
    Total Drives: {total_drives}
    Total Applications: {total_applications}
    Total Selected: {total_selected}
    """

    html = f"""
    <html>
    <body>
    <h1>Monthly Report</h1>
    <p>Total Drives: {total_drives}</p>
    <p>Total Applications: {total_applications}</p>
    <p>Total Selected: {total_selected}</p>
    </body>
    </html>
    """

    report_path = 'monthly_report.html'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(html)

    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = os.environ.get('SMTP_PORT')
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    admin_email = os.environ.get('ADMIN_EMAIL')

    if smtp_host and smtp_port and smtp_user and smtp_pass and admin_email:
        try:
            msg = EmailMessage()
            msg['Subject'] = 'Placement Portal: Monthly Activity Report'
            msg['From'] = smtp_user
            msg['To'] = admin_email
            msg.set_content('Monthly report attached')

            with open(report_path, 'rb') as f:
                report_data = f.read()
            msg.add_attachment(report_data, maintype='text', subtype='html', filename=report_path)

            with smtplib.SMTP_SSL(smtp_host, int(smtp_port)) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        except Exception:
            print(report)
    else:
        print(report)

    connection.close()