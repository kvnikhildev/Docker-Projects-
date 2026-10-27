import os

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

DATABASE_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "employees"),
    "user": os.getenv("DB_USER", "appuser"),
    "password": os.getenv("DB_PASSWORD", "local_dev_password"),
}


def get_db_connection():
    return psycopg2.connect(**DATABASE_CONFIG)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Employee Management API",
        "status": "running"
    })


@app.route("/health", methods=["GET"])
def health():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")

        return jsonify({
            "status": "healthy",
            "database": "connected"
        }), 200

    except psycopg2.Error:
        app.logger.exception("Database health check failed")

        return jsonify({
            "status": "unhealthy",
            "database": "disconnected"
        }), 503


@app.route("/api/employees", methods=["GET"])
def get_employees():
    try:
        with get_db_connection() as connection:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute("""
                    SELECT id, name, email, department
                    FROM employees
                    ORDER BY id DESC
                """)

                employees = cursor.fetchall()

        return jsonify([dict(employee) for employee in employees]), 200

    except psycopg2.Error:
        app.logger.exception("Unable to retrieve employees")

        return jsonify({
            "error": "Database operation failed"
        }), 503


@app.route("/api/employees", methods=["POST"])
def create_employee():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required"}), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    department = str(data.get("department", "")).strip()

    if not name or not email or not department:
        return jsonify({
            "error": "Name, email, and department are required"
        }), 400

    if (
        len(name) > 100
        or len(email) > 255
        or len(department) > 100
    ):
        return jsonify({
            "error": "One or more fields are too long"
        }), 400

    if "@" not in email:
        return jsonify({
            "error": "Please provide a valid email address"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute("""
                    INSERT INTO employees (name, email, department)
                    VALUES (%s, %s, %s)
                    RETURNING id, name, email, department
                """, (name, email, department))

                employee = dict(cursor.fetchone())

        return jsonify(employee), 201

    except psycopg2.errors.UniqueViolation:
        return jsonify({
            "error": "An employee with this email already exists"
        }), 409

    except psycopg2.Error:
        app.logger.exception("Unable to create employee")

        return jsonify({
            "error": "Database operation failed"
        }), 503


@app.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    "DELETE FROM employees WHERE id = %s",
                    (employee_id,)
                )

                deleted_count = cursor.rowcount

        if deleted_count == 0:
            return jsonify({
                "error": "Employee not found"
            }), 404

        return jsonify({
            "message": "Employee deleted successfully"
        }), 200

    except psycopg2.Error:
        app.logger.exception("Unable to delete employee")

        return jsonify({
            "error": "Database operation failed"
        }), 503


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )