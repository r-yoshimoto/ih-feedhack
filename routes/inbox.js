const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");

router.get("/", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("inbox", {
    error: req.flash("error"),
    success: req.flash("success")
  });
});

module.exports = router;
