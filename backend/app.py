from flask import Flask, render_template, send_from_directory
from flask_session import Session
import redis

from database_config import create_tables, create_administrator
from routes.auth_routes import auth_routes
from routes.user_routes import user_routes
from routes.admin_routes import admin_routes
from routes.company_routes import company_routes
from routes.student_routes import student_routes
from flask_cors import CORS
import os

app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend",
    static_url_path="/frontend",
)

CORS(app, supports_credentials=True)

app.secret_key = "placement_portal_secret_key"

try:
    redis_client = redis.Redis(host="localhost", port=6379, socket_connect_timeout=1)
    redis_client.ping()
    redis_available = True
except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
    redis_available = False

if redis_available:
    app.config["SESSION_TYPE"] = "redis"
    app.config["SESSION_REDIS"] = redis_client
else:
    print("⚠️ Redis is not running on localhost:6379. Falling back to filesystem session management.")
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_FILE_DIR"] = os.path.join(os.path.dirname(__file__), "flask_sessions")

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True

Session(app)

create_tables()
create_administrator()

app.register_blueprint(auth_routes, url_prefix="/auth")
app.register_blueprint(user_routes, url_prefix="/user")
app.register_blueprint(admin_routes, url_prefix="/admin")
app.register_blueprint(company_routes, url_prefix="/company")
app.register_blueprint(student_routes, url_prefix="/student")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    return render_template("index.html")


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(uploads_dir, filename)


if __name__ == "__main__":
    app.run(debug=True)
