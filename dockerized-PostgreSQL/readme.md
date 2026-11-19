# PostgreSQL with Docker Compose

A beginner-friendly PostgreSQL setup using Docker Compose on Ubuntu. This project demonstrates PostgreSQL database creation, SQL table initialization, Docker containerization, persistent storage using Docker volumes, and database management using pgAdmin.

## 1. Project Overview

Technologies used:

- **PostgreSQL 17** – Relational database management system.
- **Docker** – Containerization platform.
- **Docker Compose** – Container configuration and orchestration.
- **pgAdmin 4** – Graphical PostgreSQL management tool.
- **SQL** – Database and table creation.

## 2. Project Structure

```text
my-project/
│
├── database/
│   ├── init/
│   │   └── 01-create-tables.sql
│   │
│   └── backups/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

### Directory Explanation

| Directory/File | Purpose |
|---|---|
| `database/init/` | Contains SQL files used to create initial database tables. |
| `database/backups/` | Stores PostgreSQL database backups. |
| `.env` | Stores database credentials and environment variables. |
| `.env.example` | Provides an example environment configuration. |
| `.gitignore` | Prevents sensitive files from being uploaded to GitHub. |
| `docker-compose.yml` | Defines and configures the PostgreSQL container. |
| `README.md` | Project documentation. |

## 3. Prerequisites

- Ubuntu Linux
- Docker Engine
- Docker Compose plugin
- pgAdmin 4 (optional)

Check Docker installation:

```bash
docker --version
docker compose version
```

## 4. Environment Configuration

Create a `.env` file in the project root:

```env
DB_PASSWORD=your_strong_password
```

Create a `.env.example` file:

```env
DB_PASSWORD=change_me
```

**Important:** Never upload your actual `.env` file or database credentials to GitHub.

## 5. Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: my-postgres

    restart: unless-stopped

    environment:
      POSTGRES_DB: my_application
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}

    ports:
      - "127.0.0.1:5432:5432"

    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

### Configuration Explanation

| Configuration | Description |
|---|---|
| `image` | Uses PostgreSQL version 17. |
| `container_name` | Names the container `my-postgres`. |
| `POSTGRES_DB` | Creates the initial database. |
| `POSTGRES_USER` | Creates the initial database user. |
| `POSTGRES_PASSWORD` | Sets the initial database user's password. |
| `ports` | Maps Ubuntu port 5432 to container port 5432. |
| `postgres_data` | Persists PostgreSQL database files. |
| `database/init` | Mounts SQL initialization scripts. |

## 6. Database Initialization

Inside the `database/init/` directory, create:

`01-create-tables.sql`

Example:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

This SQL file defines the initial structure of the users table.

During the first PostgreSQL initialization, the official PostgreSQL Docker image automatically executes supported SQL scripts from:

```text
/docker-entrypoint-initdb.d/
```

The initialization process:

1. Creates the PostgreSQL database.
2. Creates the initial database user.
3. Executes the SQL initialization file.
4. Creates the users table.
5. Makes the database ready for connections.

**Note:** Initialization SQL files execute only when PostgreSQL initializes an empty data directory. Editing or adding SQL files later does not automatically update an existing database.

## 7. Start PostgreSQL Container

Start PostgreSQL using Docker Compose:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

View PostgreSQL logs:

```bash
docker logs my-postgres
```

## 8. Connect to PostgreSQL

Connect to the PostgreSQL database:

```bash
docker exec -it my-postgres psql -U appuser -d my_application
```

List tables:

```sql
\dt
```

View table structure:

```sql
\d users
```

Insert sample data:

```sql
INSERT INTO users (username, email)
VALUES ('John', 'john@example.com');
```

Retrieve records:

```sql
SELECT * FROM users;
```

Exit PostgreSQL:

```sql
\q
```

## 9. Connect Using pgAdmin

Open pgAdmin 4 and register a new server.

### General Tab

```text
Name: Docker PostgreSQL
```

### Connection Tab

```text
Host: localhost
Port: 5432
Maintenance Database: my_application
Username: appuser
Password: Your DB_PASSWORD
```

Save the connection.

You can now manage your PostgreSQL database through pgAdmin.

## 10. Database Persistence Using Docker Volumes

This project uses a named Docker volume:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

The volume stores PostgreSQL database files separately from the container's writable layer.

### Benefits

- Data survives container restarts.
- Data survives normal container removal.
- Data remains available when containers are recreated.
- Database storage is separated from the container lifecycle.

### Test Data Persistence

Stop containers:

```bash
docker compose stop
```

Start containers:

```bash
docker compose start
```

Check your database records again.

Your previously inserted records should remain available.

You can also recreate the container:

```bash
docker compose down
docker compose up -d
```

Your named volume remains intact.

**Warning:** Avoid `docker compose down -v` unless you intentionally want to delete the associated named volumes and database data.

## 11. Database Backup and Restore

Create the backup directory:

```bash
mkdir -p database/backups
```

Create a database backup:

```bash
docker exec my-postgres pg_dump \
-U appuser my_application \
> database/backups/backup.sql
```

Restore the backup into an existing empty database:

```bash
cat database/backups/backup.sql | \
docker exec -i my-postgres psql \
-U appuser -d my_application
```

Keep backups outside the PostgreSQL container.

For production environments, store backups on separate storage and test restoration regularly.

## 12. Useful Docker Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start containers in the background. |
| `docker compose down` | Stop and remove containers. |
| `docker compose stop` | Stop containers. |
| `docker compose start` | Start existing containers. |
| `docker compose restart` | Restart containers. |
| `docker compose ps` | Display running services. |
| `docker compose logs` | Display service logs. |
| `docker volume ls` | List Docker volumes. |
| `docker volume inspect <name>` | Inspect a Docker volume. |
| `docker exec -it my-postgres bash` | Access the container terminal. |

NIHKIL 
https://github.com/kvnikhildev
