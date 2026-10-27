CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (name, email, department)
VALUES
    ('John Smith', 'john@example.com', 'DevOps'),
    ('Sarah Johnson', 'sarah@example.com', 'Engineering'),
    ('David Brown', 'david@example.com', 'IT Support')
ON CONFLICT (email) DO NOTHING;