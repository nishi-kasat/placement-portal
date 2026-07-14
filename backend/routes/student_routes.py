from flask import Blueprint, jsonify, session, request
from database_config import get_database_connection
from datetime import datetime
from redis_cache import get_cache, set_cache
import os
from werkzeug.utils import secure_filename
from tasks.export_csv_task import export_applications_csv
from redis_cache import delete_cache

student_routes = Blueprint("student_routes", __name__)

def check_student():
    return "user_role" in session and session["user_role"] == "student"


def get_student_id(user_id):
    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT student_id FROM student WHERE user_id = ?", (user_id,))
    student = cursor.fetchone()

    connection.close()

    if student:
        return student["student_id"]
    return None


@student_routes.route("/dashboard", methods=["GET"])
def student_dashboard():
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]

    cache_key = f"student_dashboard_{user_id}"

    cached_data = get_cache(cache_key)
    if cached_data:
        return jsonify(cached_data)

    student_id = get_student_id(user_id)

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT placement_drive.*, company.company_name
        FROM placement_drive
        JOIN company ON placement_drive.company_id = company.company_id
        WHERE placement_drive.status = 'approved'
    """)
    drives = cursor.fetchall()

    cursor.execute("""
        SELECT drive_id, status
        FROM application
        WHERE student_id = ?
    """, (student_id,))
    applications = cursor.fetchall()

    connection.close()

    result = {
        "drives": [dict(d) for d in drives],
        "applications": [dict(a) for a in applications]
    }

    set_cache(cache_key, result, expiry=60)

    return jsonify(result)


@student_routes.route("/apply/<int:drive_id>", methods=["POST"])
def apply_drive(drive_id):
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]
    student_id = get_student_id(user_id)

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT * FROM application
        WHERE student_id = ? AND drive_id = ?
    """, (student_id, drive_id))

    existing = cursor.fetchone()

    if existing:
        connection.close()
        return jsonify({"message": "already applied"}), 400

    cursor.execute("""
        SELECT eligibility_branch, eligibility_cgpa, eligibility_year
        FROM placement_drive
        WHERE drive_id = ? AND status = 'approved'
    """, (drive_id,))
    drive = cursor.fetchone()

    # convert sqlite row to dict for consistent access
    if drive:
        drive = dict(drive)

    if not drive:
        connection.close()
        return jsonify({"message": "drive not available"}), 404

    # Check application deadline (if provided). Reject if now is after deadline.
    application_deadline = drive.get("application_deadline")
    if application_deadline:
        parsed_deadline = None
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                parsed_deadline = datetime.strptime(str(application_deadline), fmt)
                break
            except Exception:
                parsed_deadline = None
        if parsed_deadline:
            if datetime.now() > parsed_deadline:
                connection.close()
                return jsonify({"message": "application deadline has passed"}), 400

    cursor.execute("""
        SELECT branch, cgpa, graduation_year
        FROM student
        WHERE student_id = ?
    """, (student_id,))
    student = cursor.fetchone()

    # convert sqlite row to dict for consistent access
    if student:
        student = dict(student)

    # Branch check (allow multiple branches comma-separated).
    # If eligibility_branch contains 'Any' (case-insensitive) then allow all branches.
    eligibility_branch = drive.get("eligibility_branch")
    if eligibility_branch:
        branches = [b.strip().upper() for b in str(eligibility_branch).split(',') if b.strip()]
        if not any(b == 'ANY' for b in branches):
            student_branch = (student.get("branch") or "").upper()
            if not student_branch or student_branch not in branches:
                connection.close()
                return jsonify({"message": "branch not eligible"}), 403

    # CGPA check
    try:
        required_cgpa = float(drive["eligibility_cgpa"] or 0)
    except Exception:
        required_cgpa = 0.0
    try:
        student_cgpa = float(student["cgpa"])
    except Exception:
        student_cgpa = 0.0
    if student_cgpa < required_cgpa:
        connection.close()
        return jsonify({"message": "cgpa not eligible"}), 403

    # Graduation year check:
    # If eligibility_year is an integer X (or a list containing integers), allow students
    # whose graduation_year is <= max(eligible years). This makes "2027" include
    # students graduating in or before 2027.
    eligibility_year = drive.get("eligibility_year")
    if eligibility_year is not None and eligibility_year != "":
        years = []
        if isinstance(eligibility_year, int):
            years = [int(eligibility_year)]
        else:
            for token in str(eligibility_year).split(','):
                token = token.strip()
                if not token:
                    continue
                try:
                    years.append(int(token))
                except Exception:
                    # non-integer token; ignore for numeric logic
                    pass

        if years:
            try:
                student_year = int(student.get("graduation_year") or 0)
            except Exception:
                connection.close()
                return jsonify({"message": "year not eligible"}), 403

            max_allowed = max(years)
            if student_year > max_allowed:
                connection.close()
                return jsonify({"message": "year not eligible"}), 403
        else:
            # Fallback to string membership check if eligibility_year isn't numeric
            allowed_years = [y.strip() for y in str(eligibility_year).split(',') if y.strip()]
            if allowed_years and str(student.get("graduation_year")) not in allowed_years:
                connection.close()
                return jsonify({"message": "year not eligible"}), 403

    application_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO application (student_id, drive_id, application_date)
        VALUES (?, ?, ?)
    """, (student_id, drive_id, application_date))

    connection.commit()
    connection.close()

    # invalidate this student's dashboard cache so applied status updates immediately
    try:
        cache_key = f"student_dashboard_{user_id}"
        delete_cache(cache_key)
    except Exception:
        pass

    return jsonify({"message": "application submitted"})




@student_routes.route("/applications", methods=["GET"])
def get_applications():
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]
    student_id = get_student_id(user_id)

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT placement_drive.job_title, application.status, application.application_date,
               application.interview_date, application.interview_details
        FROM application
        JOIN placement_drive ON application.drive_id = placement_drive.drive_id
        WHERE application.student_id = ?
    """, (student_id,))

    applications = cursor.fetchall()

    connection.close()

    return jsonify([dict(a) for a in applications])

@student_routes.route("/export_csv", methods=["GET"])
def export_csv():
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session["user_id"]
    student_id = get_student_id(user_id)

    task = export_applications_csv.delay(student_id)

    return jsonify({
        "message": "csv export started",
        "task_id": task.id
    })


@student_routes.route("/task_status/<task_id>", methods=["GET"])
def task_status(task_id):
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    try:
        from celery.result import AsyncResult
        res = AsyncResult(task_id)
        status = res.status
        ready = res.ready()
    except Exception:
        status = "SUCCESS"
        ready = True

    return jsonify({
        "status": status,
        "ready": ready
    })


@student_routes.route("/upload_resume", methods=["POST"])
def upload_resume():
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    if 'resume' not in request.files:
        return jsonify({"message": "no file provided"}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({"message": "no filename"}), 400

    user_id = session["user_id"]
    student_id = get_student_id(user_id)

    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
    os.makedirs(uploads_dir, exist_ok=True)

    filename = secure_filename(f"student_{student_id}_" + file.filename)
    file_path = os.path.join(uploads_dir, filename)
    file.save(file_path)

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("UPDATE student SET resume_path = ? WHERE student_id = ?", (file_path, student_id))

    connection.commit()
    connection.close()

    return jsonify({"message": "resume uploaded", "resume_path": file_path})


@student_routes.route('/profile', methods=['GET'])
def get_profile():
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    user_id = session['user_id']

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT u.user_id, u.username, s.student_id, s.full_name, s.branch, s.cgpa, s.graduation_year, s.resume_path FROM user u JOIN student s ON u.user_id = s.user_id WHERE u.user_id = ?", (user_id,))
    row = cursor.fetchone()
    connection.close()

    if not row:
        return jsonify({}), 404

    return jsonify({
        "user_id": row['user_id'],
        "username": row['username'],
        "student_id": row['student_id'],
        "full_name": row['full_name'],
        "branch": row['branch'],
        "cgpa": row['cgpa'],
        "graduation_year": row['graduation_year'],
        "resume_path": row['resume_path']
    })


@student_routes.route('/profile', methods=['PUT'])
def update_profile():
    if not check_student():
        return jsonify({"message": "unauthorized"}), 403

    data = request.get_json()
    user_id = session['user_id']

    full_name = data.get('full_name')
    branch = data.get('branch')
    cgpa = data.get('cgpa')
    graduation_year = data.get('graduation_year')

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT student_id FROM student WHERE user_id = ?", (user_id,))
    s = cursor.fetchone()
    if not s:
        connection.close()
        return jsonify({"message": "student not found"}), 404

    cursor.execute("UPDATE student SET full_name = ?, branch = ?, cgpa = ?, graduation_year = ? WHERE user_id = ?", (full_name, branch, cgpa, graduation_year, user_id))
    connection.commit()
    connection.close()

    # invalidate student's dashboard cache
    cursor_key = f"student_dashboard_{user_id}"
    try:
        delete_cache(cursor_key)
    except Exception:
        pass

    return jsonify({"message": "profile updated"})