# 🎓 Student Management System

A web-based Student Management System built using **Node.js, Express.js, MongoDB, Mongoose, and EJS**. The application provides user authentication and student management functionality, with Docker support for easy deployment.


## 🚀 Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Backend web framework
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB object modeling
- **EJS** – Template engine
- **Docker** – Application containerization
- **Docker Compose** – Multi-container management
- **bcryptjs** – Password hashing
- **express-session** – Session management
- **connect-mongo** – MongoDB session storage

## ✨ Features

- User authentication and login
- Secure password hashing using bcrypt
- MongoDB-backed session management
- Student management functionality
- Server-rendered pages using EJS
- Initial administrator account creation
- Dockerized application
- Persistent MongoDB storage using Docker volumes

## 📁 Project Structure

```text
student-management/
│
├── models/
│   └── User.js
│
├── routes/
│   ├── auth.js
│   └── students.js
│
├── views/
│
├── public/
│
├── server.js
├── package.json
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── .env
```

## 🛠️ Prerequisites

Make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

## ⚙️ Environment Configuration

Create a `.env` file in the project root directory.

```env
SESSION_SECRET=your-long-random-secret

ADMIN_NAME=Nikhil
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourStrongPassword123
```

**Important:** Never upload your `.env` file to GitHub because it contains sensitive information.

## 🐳 Run Using Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/kvnikhildev/student-management.git
```

```bash
cd student-management
```

### 2. Build and start containers

```bash
docker compose up -d --build
```

### 3. Check container status

```bash
docker compose ps
```

### 4. Check application logs

```bash
docker compose logs app
```

### 5. Access the application

Open your browser:

```text
http://localhost:3000
```

## 🗄️ MongoDB Configuration

The application connects to MongoDB using:

```text
mongodb://mongo:27017/student_management
```

Here, `mongo` is the MongoDB service name defined in `docker-compose.yml`.

Docker Compose creates an internal network that allows the application container to communicate with the MongoDB container.

MongoDB data is persisted using a Docker named volume:

```yaml
volumes:
  mongo_data:
```

## 🔧 Useful Docker Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start containers |
| `docker compose up -d --build` | Rebuild and start |
| `docker compose down` | Stop and remove containers |
| `docker compose ps` | Check container status |
| `docker compose logs app` | View application logs |
| `docker compose logs mongo` | View MongoDB logs |
| `docker compose restart` | Restart services |
| `docker images` | List Docker images |
| `docker ps -a` | List all containers |

**Note:** Avoid `docker compose down -v` unless you intentionally want to delete your MongoDB volume and its stored data.

## 🧪 Troubleshooting

### MongoDB Connection Error

Check that the MongoDB service name is `mongo` and the connection string is:

```text
mongodb://mongo:27017/student_management
```

### Application Container Exits

Check application logs:

```bash
docker compose logs app
```

### MongoDB Health Check

For MongoDB 4.2.0, use:

```yaml
healthcheck:
  test: ["CMD", "mongo", "--quiet", "--eval", "db.adminCommand({ ping: 1 })"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## 🔐 Security

- Keep environment variables and passwords in `.env`.
- Never commit `.env` to GitHub.
- Use a strong session secret.
- Use a strong administrator password.
- Run application containers as a non-root user.
- Avoid exposing MongoDB publicly without proper security.

## 👨‍💻 Author

**Nikhil**

GitHub: [@kvnikhildev](https://github.com/kvnikhildev)

