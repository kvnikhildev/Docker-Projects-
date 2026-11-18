require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "development-secret-change-me",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || "mongodb://mongo:27017/student_management"
    //mongoUrl: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_management"//
  }),
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

app.get("/", (req, res) => res.redirect(req.session.user ? "/students" : "/login"));
app.use("/", authRoutes);
app.use("/students", studentRoutes);

app.use((req, res) => res.status(404).render("404", { title: "Page not found" }));

async function start() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://mongo:27017/student_management");
  console.log("Connected to MongoDB");

  // Create the first admin account if it does not already exist.
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const existing = await User.findOne({ email });
  if (!existing) {
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      name: process.env.ADMIN_NAME || "Administrator",
      email,
      passwordHash
    });
    console.log(`Initial admin created: ${email}`);
    console.log("Change the default admin password after your first login.");
  }

  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

start().catch(err => {
  console.error("Failed to start application:", err);
  process.exit(1);
});