# Employee Management System

A Dockerized, three-tier web application for managing employee records using HTML, CSS, JavaScript, Python Flask, PostgreSQL, and Nginx.

The application allows users to add employees, view employee records, and delete employees. Nginx serves the frontend and acts as a reverse proxy to the Flask backend, while PostgreSQL stores employee information.

## Features

- **Add Employees:** Create employee records with name, email, and department.
- **View Employees:** Retrieve and display employee records from PostgreSQL.
- **Delete Employees:** Remove employee records.
- **REST API:** Flask provides API endpoints for employee operations.
- **Reverse Proxy:** Nginx serves the frontend and forwards API requests to Flask.
- **Database Integration:** PostgreSQL stores employee data persistently.
- **Containerization:** Docker packages the application components into containers.
- **Orchestration:** Docker Compose manages the frontend, backend, and database services.
- **Health Check:** The backend provides an endpoint to check database connectivity.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Web Server | Nginx |
| Backend | Python, Flask |
| Database | PostgreSQL |
| Containerization | Docker |
| Container Orchestration | Docker Compose |
| Version Control | Git |

## Architecture

The application follows a three-tier architecture.

```text
                  User's Browser
                        |
                        | HTTP :8000
                        v
              +---------------------+
              |    Frontend Tier    |
              |        Nginx        |
              |   HTML, CSS, JS     |
              +---------------------+
                        |
                        | Reverse Proxy
                        | /api/*
                        v
              +---------------------+
              |  Application Tier   |
              |     Flask API       |
              |      Port 5000      |
              +---------------------+
                        |
                        | SQL Queries
                        v
              +---------------------+
              |    Database Tier    |
              |     PostgreSQL      |
              |      Port 5432      |
              +---------------------+
```

### How It Works

1. The user accesses the application through the browser.
2. Nginx serves the frontend files.
3. The frontend sends HTTP requests to the Flask API.
4. Nginx forwards API requests to the backend using Docker Compose service discovery.
5. Flask executes database operations against PostgreSQL.
6. The backend returns JSON responses to the frontend.
7. The frontend updates the employee table.

## Project Structure

```text
3-tier/
├── frontend/
│   ├── Dockerfile
│   └── index.html
│
├── backend/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
│
├── nginx/
│   └── default.conf
│
├── database/
│   └── init.sql
│
├── .env
├── .env.example
├── .gitignore
├── compose.yaml
└── README.md
```

## Prerequisites

Before running the application, install:

- Docker Engine
- Docker Compose (the Docker Compose plugin)
- Git (optional, for version control)

Verify your installations:

```bash
docker --version
docker compose version
git --version
```

## Configuration

The application uses environment variables to configure the PostgreSQL connection.

Create a `.env` file in the project root:

```env
DB_PASSWORD=your_secure_password
```

Replace `your_secure_password` with a strong password.

**Security:** Never commit your actual `.env` file or database credentials to Git. The `.env` file should be included in `.gitignore`.

You can provide a `.env.example` file containing placeholder values for other developers.

## Installation and Setup

### 1. Clone the Repository

If the project is hosted in a Git repository:

```bash
git clone <your-repository-url>
cd containerized-3tier-app
```

Alternatively, navigate to your existing project directory:

```bash
cd ~/Desktop/Project-2026/containerized-3tier-app
```

### 2. Configure Environment Variables

Create your `.env` file:

```bash
nano .env
```

Add:

```env
DB_PASSWORD=your_secure_password
```

Save the file before continuing.

### 3. Build and Start the Containers

Run the following command from the directory containing `compose.yaml`:

```bash
docker compose up -d --build
```

This builds the frontend and backend images and starts the services defined in Docker Compose.

### 4. Check Container Status

```bash
docker compose ps
```

Check the logs if any service fails to start:

```bash
docker compose logs frontend
docker compose logs backend
docker compose logs db
```

### 5. Verify Nginx Configuration

Run:

```bash
docker compose exec frontend nginx -t
```

A successful test reports that the configuration syntax is OK and the configuration test is successful.

### 6. Access the Application

Open the application in your browser:

**Frontend:** http://localhost:8000

**Employee API:** http://localhost:8000/api/employees

**Backend Health Check:** http://localhost:8000/health

The frontend is accessible through Nginx, which forwards API requests to the Flask backend.

## API Endpoints

The Flask backend exposes the following REST API endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Returns API status information |
| GET | `/health` | Checks database connectivity |
| GET | `/api/employees` | Retrieves all employees |
| POST | `/api/employees` | Creates a new employee |
| DELETE | `/api/employees/<id>` | Deletes an employee by ID |

### Get All Employees

**Request:**

```http
GET /api/employees
```

**Example response:**

```json
[
  {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "department": "IT"
  }
]
```

### Add an Employee

**Request:**

```http
POST /api/employees
Content-Type: application/json
```

**Request body:**

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "department": "IT"
}
```

A successful request returns HTTP status `201 Created`.

### Delete an Employee

**Request:**

```http
DELETE /api/employees/1
```

A successful deletion returns HTTP status `200 OK`.

If the employee does not exist, the API returns HTTP status `404 Not Found`.

## Nginx Reverse Proxy

Nginx serves the frontend files and forwards API requests to the Flask backend.

The configuration is stored in:

```text
nginx/default.conf
```

The API proxy configuration is:

```nginx
location /api/ {
    proxy_pass http://backend:5000;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Here, `backend` is the Docker Compose service name of the Flask application.

Docker Compose provides service discovery, allowing Nginx to reach Flask over the internal Docker network.

The frontend uses a relative API URL:

```javascript
const API_URL = "/api/employees";
```

This allows the browser to send API requests through Nginx without requiring a separate backend URL in the frontend code.

## Database

The application uses PostgreSQL to store employee records.

The database configuration is provided through environment variables:

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL service hostname |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |

The current configuration uses:

```text
DB_HOST=db
DB_PORT=5432
DB_NAME=emp_list
DB_USER=admin
DB_PASSWORD=<configured through .env>
```

The database initialization script is located at:

```text
database/init.sql
```

The initialization script should create the `employees` table with the following fields:

| Column | Type | Description |
|---|---|---|
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(100) | Employee name |
| `email` | VARCHAR(255) | Employee email; must be unique |
| `department` | VARCHAR(100) | Employee department |

The database uses a Docker named volume to persist data across container restarts and recreations.

**Note:** PostgreSQL initialization scripts run automatically when the database directory is initialized for the first time. Changes to the initialization script do not automatically update an existing database.

## Useful Docker Commands

### Start the Application

```bash
docker compose up -d
```

### Rebuild Images

```bash
docker compose up -d --build
```

### Stop the Application

```bash
docker compose down
```

### View Running Containers

```bash
docker compose ps
```

### View All Service Logs

```bash
docker compose logs
```

### Follow Backend Logs

```bash
docker compose logs -f backend
```

### Restart a Service

```bash
docker compose restart frontend
```

### Check Nginx Configuration

```bash
docker compose exec frontend nginx -t
```

### Open a Shell in the Backend Container

```bash
docker compose exec backend sh
```

### Stop the Application and Remove Database Data

```bash
docker compose down -v
```

**Warning:** The last command removes named volumes declared by the Compose project, including the PostgreSQL data volume. This can permanently delete stored employee records. Use it only when you intentionally want to reset the database.

## Troubleshooting

### Frontend Does Not Load

Check the frontend container:

```bash
docker compose ps
docker compose logs frontend
```

Verify that port `8000` is mapped to container port `80`.

### Nginx Configuration Error

Run:

```bash
docker compose exec frontend nginx -t
```

Verify that `nginx/default.conf` exists and is a regular file.

Check that the Compose volume mount points to the correct file:

```yaml
volumes:
  - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
```

### API Requests Fail

Check the backend logs:

```bash
docker compose logs backend
```

Verify that the Nginx configuration uses:

```nginx
proxy_pass http://backend:5000;
```

The hostname must match the backend service name in `compose.yaml`.

### Database Connection Fails

Check the database container:

```bash
docker compose logs db
```

Verify that `DB_HOST` is set to `db` and that the database credentials match those configured for PostgreSQL.

### Employee Table Does Not Exist

Check that `database/init.sql` creates the `employees` table.

If the database volume already existed when you added the initialization script, execute the SQL against the existing database manually.

## Security Considerations

- Keep database passwords in environment variables rather than hardcoding them in application source files.
- Never commit `.env` files containing real secrets.
- Use parameterized SQL queries to help prevent SQL injection.
- Avoid exposing the PostgreSQL port publicly in production.
- Use HTTPS when deploying the application to a public server.
- Configure authentication and authorization before using the application for sensitive employee information.




Auther
Nikhil 

Github:https://github.com/kvnikhildev/

