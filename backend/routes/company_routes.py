from flask import Blueprint, request, jsonify, session
from database_config import get_database_connection

company_routes = Blueprint("company_routes", __name__)

def check_company():
    return "user_role" in session and session["user_role"] == "company"


def get_company_id(user_id):
    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT company_id FROM company WHERE user_id = ?", (user_id,))
    company = cursor.fetchone()

    connection.close()

    if company:
        return company["company_id"]
    return None


@company_routes.route("/dashboard", methods=["GET"])
def company_dashboard():
    if not check_company():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]
    company_id = get_company_id(user_id)

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT company.*, user.username
        FROM company
        JOIN user ON company.user_id = user.user_id
        WHERE company.company_id = ?
    """, (company_id,))
    company_details = cursor.fetchone()

    cursor.execute("""
        SELECT drive_id, job_title, status,
        (SELECT COUNT(*) FROM application WHERE drive_id = placement_drive.drive_id) as applicants
        FROM placement_drive
        WHERE company_id = ?
    """, (company_id,))
    drives = cursor.fetchall()

    connection.close()

    return jsonify({
        "company": dict(company_details),
        "drives": [dict(d) for d in drives]
    })


@company_routes.route("/create_drive", methods=["POST"])
def create_drive():
    if not check_company():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]

    connection = get_database_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT company_id, approval_status FROM company WHERE user_id = ?", (user_id,))
    company = cursor.fetchone()

    if not company:
        connection.close()
        return jsonify({"message": "company profile not found"}), 404

    if company["approval_status"] != "approved":
        connection.close()
        return jsonify({"message": "company must be approved by admin to create drives"}), 403

    company_id = company["company_id"]

    data = request.get_json()

    job_title = data.get("job_title")
    job_description = data.get("job_description")
    eligibility_branch = data.get("eligibility_branch")
    eligibility_cgpa = data.get("eligibility_cgpa")
    eligibility_year = data.get("eligibility_year")
    application_deadline = data.get("application_deadline")

    cursor.execute("""
        INSERT INTO placement_drive (
            company_id,
            job_title,
            job_description,
            eligibility_branch,
            eligibility_cgpa,
            eligibility_year,
            application_deadline
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        company_id,
        job_title,
        job_description,
        eligibility_branch,
        eligibility_cgpa,
        eligibility_year,
        application_deadline
    ))

    connection.commit()
    connection.close()

    return jsonify({"message": "drive created and pending admin approval"})


@company_routes.route("/close_drive/<int:drive_id>", methods=["POST"])
def close_drive(drive_id):
    if not check_company():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]
    company_id = get_company_id(user_id)

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT company_id FROM placement_drive WHERE drive_id = ?", (drive_id,))
    drive = cursor.fetchone()
    if not drive:
        connection.close()
        return jsonify({"message": "drive not found"}), 404

    if drive["company_id"] != company_id:
        connection.close()
        return jsonify({"message": "unauthorized"}), 403

    cursor.execute("UPDATE placement_drive SET status = 'closed' WHERE drive_id = ?", (drive_id,))
    connection.commit()
    connection.close()

    try:
        from redis_cache import clear_student_dashboards
        clear_student_dashboards()
    except Exception:
        pass

    return jsonify({"message": "drive closed successfully"})


@company_routes.route("/applications/<int:drive_id>", methods=["GET"])
def get_applications(drive_id):
    if not check_company():
        return jsonify({"message": "unauthorized"}), 403

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT application.application_id, student.full_name, application.status,
               application.interview_date, application.interview_details
        FROM application
        JOIN student ON application.student_id = student.student_id
        WHERE application.drive_id = ?
    """, (drive_id,))

    applications = cursor.fetchall()

    connection.close()

    return jsonify([dict(a) for a in applications])


@company_routes.route("/update_status/<int:application_id>", methods=["POST"])
def update_application_status(application_id):
    if not check_company():
        return jsonify({"message": "unauthorized"}), 403

    data = request.get_json()
    status = data.get("status")
    interview_date = data.get("interview_date")
    interview_details = data.get("interview_details")

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE application
        SET status = ?, interview_date = ?, interview_details = ?
        WHERE application_id = ?
    """, (status, interview_date, interview_details, application_id))

    connection.commit()
    connection.close()

    return jsonify({"message": "status updated"})