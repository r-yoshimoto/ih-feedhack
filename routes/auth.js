const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const User = require("../models/users");
const transporter = require("../services/nodemailer")

router.get("/login", (req, res, next) => {
  if (req.user) {
    req.flash(
      "error",
      `You are already logged in, but you can logout <a href="/logout?=fool">clicking here</a> and login again if needed.`
    );
    res.send("should point later to INBOX");
  }

  res.render("auth/login", {
    error: req.flash("error"),
    success: req.flash("success")
  });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/inbox",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/logout",ensureLogin.ensureLoggedIn(), (req, res) => {
  req.logout();
  res.redirect("/login");
});

router.get("/sign-up", (req, res, next) => {
  res.render("auth/sign-up", {
    error: req.flash("error")
  });
});

router.post("/sign-up", (req, res, next) => {
  const { email, password, fullName } = req.body;

  if (fullName == "" || email == "" || password == "") {
    res.render("auth/sign-up", {
      error: `Name, e-mail and password can't be empty.`
    });
    return;
  }

  User.findOne({ email: email })
    .then(user => {
      if (user !== null) {
        req.flash(
          "error",
          `This e-mail is already registered, if you lost you account <a href="#">click here</a> to recover it.`
        );
        res.redirect("/sign-up");

        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let confirmationCode = "";
      for (let i = 0; i < 25; i++) {
        confirmationCode +=
          characters[Math.floor(Math.random() * characters.length)];
      }

      const newUser = new User({
        email,
        password: hashPass,
        fullName,
        confirmationCode
      });

      newUser
        .save()
        .then(user => {
          transporter
            .sendMail({
              from: "ih-feedback.herokuapp.com",
              to: email,
              subject: "Welcome to Feedback!",
              html: `In order to use our app, please click <a href="http://localhost:3000/confirm/${confirmationCode}">here</a> to confirm your e-mail.
              `
            })
            .then(info => console.log("nodemailer success -->", info))
            .catch(error => console.log(error));

          req.flash(
            "success",
            "Account created, we've send you a confirmation link to your e-mail."
          );
          res.redirect("/login");
        })
        .catch(err => {
          throw new Error(err);
        });
    })
    .catch(err => {
      throw new Error(err);
    });
});

module.exports = router;
