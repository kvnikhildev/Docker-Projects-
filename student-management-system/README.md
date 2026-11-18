# Student Management System

A complete beginner-friendly student records application built with **Node.js, Express, MongoDB, EJS and plain CSS**.

## Features

- Admin login with bcrypt password hashing and session-based authentication
- Add, view, edit and delete student records (CRUD)
- Search students by ID, name, email or course
- Form validation and duplicate student ID protection
- Responsive dashboard and student profile pages
- MongoDB-backed sessions

## Requirements

- Node.js 18 or newer
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- npm

## Setup

1. Extract the project folder and open it in VS Code.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to a new file named `.env`.
5. Edit `.env` and set your MongoDB connection string and a strong session secret. Change the initial admin password.

   Example local configuration:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/student_management
   SESSION_SECRET=use_a_long_random_secret_here
   ADMIN_NAME=Administrator
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=ChangeThisPassword123!
   ```

6. Make sure MongoDB is running.
7. Start the app:

   ```bash
   npm run dev
   ```

   Or use `npm start` for normal mode.

8. Open `http://localhost:3000` in your browser.

## First login

Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `.env`. The application creates this initial admin user automatically when it starts for the first time. Keep `.env` private and change the sample password before using the app.

## Project structure

```text
student-management-system/
├── middleware/
│   └── auth.js
├── models/
│   ├── Student.js
│   └── User.js
├── public/
│   └── css/
│       └── style.css
├── routes/
│   ├── auth.js
│   └── students.js
├── views/
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── students/
│   │   ├── form.ejs
│   │   ├── index.ejs
│   │   └── show.ejs
│   ├── 404.ejs
│   └── login.ejs
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Main routes

| Method | URL | Purpose |
|---|---|---|
| GET | `/login` | Show admin login |
| POST | `/login` | Authenticate admin |
| POST | `/logout` | Log out |
| GET | `/students` | List and search students |
| GET | `/students/new` | Show add form |
| POST | `/students` | Create student |
| GET | `/students/:id` | View student |
| GET | `/students/:id/edit` | Show edit form |
| POST | `/students/:id/update` | Update student |
| POST | `/students/:id/delete` | Delete student |

## Notes

- Student ID must be unique.
- Academic year accepts values from 1 through 8.
- All student pages require an authenticated admin session.
- This is a solid educational starter project. Before public production deployment, add CSRF protection, login rate limiting, secure cookie settings behind HTTPS, audit logging, and a password-change workflow.
