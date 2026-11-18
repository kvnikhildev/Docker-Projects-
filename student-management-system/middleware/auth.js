module.exports = function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.error = "Please log in to continue.";
    return res.redirect("/login");
  }
  next();
};