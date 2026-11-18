const express = require("express");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function showValidationErrors(req, res, errors, student = {}) {
  req.session.error = errors.array().map(e => e.msg).join(" ");
  req.session.formData = student;
  return res.redirect(student._id ? `/students/${student._id}/edit` : "/students/new");
}

const studentRules = [
  body("studentId").trim().notEmpty().withMessage("Student ID is required."),
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("email").trim().isEmail().withMessage("Enter a valid email address."),
  body("course").trim().notEmpty().withMessage("Course is required."),
  body("year").isInt({ min: 1, max: 8 }).withMessage("Year must be between 1 and 8.")
];

router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const filter = search ? {
      $or: [
        { studentId: new RegExp(escapeRegex(search), "i") },
        { firstName: new RegExp(escapeRegex(search), "i") },
        { lastName: new RegExp(escapeRegex(search), "i") },
        { email: new RegExp(escapeRegex(search), "i") },
        { course: new RegExp(escapeRegex(search), "i") }
      ]
    } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    const total = await Student.countDocuments();
    res.render("students/index", { title: "Students", students, search, total });
  } catch (err) {
    console.error(err);
    req.session.error = "Could not load students.";
    res.redirect("/students");
  }
});

router.get("/new", (req, res) => {
  const formData = req.session.formData || {};
  delete req.session.formData;
  res.render("students/form", { title: "Add student", student: formData, isEdit: false });
});

router.post("/", studentRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return showValidationErrors(req, res, errors, req.body);
  try {
    await Student.create({
      studentId: req.body.studentId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      course: req.body.course,
      year: Number(req.body.year),
      dateOfBirth: req.body.dateOfBirth || undefined,
      address: req.body.address
    });
    req.session.success = "Student added successfully.";
    res.redirect("/students");
  } catch (err) {
    req.session.error = err.code === 11000 ? "That student ID is already in use." : "Could not add student.";
    req.session.formData = req.body;
    res.redirect("/students/new");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).render("404", { title: "Student not found" });
    res.render("students/show", { title: student.fullName, student });
  } catch {
    res.status(404).render("404", { title: "Student not found" });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).render("404", { title: "Student not found" });
    const formData = req.session.formData || student;
    delete req.session.formData;
    res.render("students/form", { title: "Edit student", student: formData, isEdit: true });
  } catch {
    res.status(404).render("404", { title: "Student not found" });
  }
});

router.post("/:id/update", studentRules, async (req, res) => {
  const errors = validationResult(req);
  const data = { ...req.body, _id: req.params.id };
  if (!errors.isEmpty()) return showValidationErrors(req, res, errors, data);
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, {
      studentId: req.body.studentId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      course: req.body.course,
      year: Number(req.body.year),
      dateOfBirth: req.body.dateOfBirth || null,
      address: req.body.address
    }, { new: true, runValidators: true });
    if (!student) return res.status(404).render("404", { title: "Student not found" });
    req.session.success = "Student details updated.";
    res.redirect(`/students/${student._id}`);
  } catch (err) {
    req.session.error = err.code === 11000 ? "That student ID is already in use." : "Could not update student.";
    req.session.formData = data;
    res.redirect(`/students/${req.params.id}/edit`);
  }
});

router.post("/:id/delete", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    req.session.success = "Student deleted.";
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    req.session.error = "Could not delete student.";
    res.redirect("/students");
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;