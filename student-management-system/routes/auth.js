const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/students");
  res.render("login", { title: "Admin login" });
});

router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      req.session.error = "Invalid email or password.";
      return res.redirect("/login");
    }
    req.session.regenerate(err => {
      if (err) return res.status(500).send("Could not create session.");
      req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
      req.session.success = `Welcome back, ${user.name}.`;
      res.redirect("/students");
    });
  } catch (err) {
    console.error(err);
    req.session.error = "Unable to log in. Please try again.";
    res.redirect("/login");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;