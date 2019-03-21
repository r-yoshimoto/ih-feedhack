const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const User = require("../models/users");
const transporter = require("../services/nodemailer");

router.get("/login", (req, res, next) => {
  if (req.user) {
    req.flash(
      "error",
      `You are already logged in, but you can logout <a href="/logout?=fool">clicking here</a> and login again if needed.`
    );
    res.redirect("/inbox");
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
  })
);

router.get("/logout", ensureLogin.ensureLoggedIn(), (req, res) => {
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
      let emailConfirmationCode = "";
      for (let i = 0; i < 25; i++) {
        emailConfirmationCode +=
          characters[Math.floor(Math.random() * characters.length)];
      }

      const newUser = new User({
        email,
        password: hashPass,
        fullName,
        emailConfirmationCode
      });

      newUser
        .save()
        .then(user => {
          transporter
            .sendMail({
              from: "ih-feedback.herokuapp.com",
              to: email,
              subject: "Welcome to Feedback!",
              html: `In order to use our app, please click <a href="http://localhost:3000/confirm/${emailConfirmationCode}">here</a> to confirm your e-mail.
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

router.get("/confirm/resend/:emailConfirmationCode", (req, res) => {
  const { emailConfirmationCode } = req.params;

  User.findOne({ emailConfirmationCode })
    .then(user => {
      transporter
        .sendMail({
          from: "ih-feedback.herokuapp.com",
          to: user.email,
          subject: "[RESEND] Welcome to Feedback!",
          html: `In order to use our app, please click <a href="http://localhost:3000/confirm/${emailConfirmationCode}">here</a> to confirm your e-mail.
        `
        })
        .then(info => console.log("nodemailer success -->", info))
        .catch(error => console.log(error));

      req.flash("success", "We've resend your code, please check your email.");
      res.redirect("/login");
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/confirm/:emailConfirmationCode", (req, res) => {
  const { emailConfirmationCode } = req.params;

  User.findOneAndUpdate(
    { emailConfirmationCode },
    { $set: { status: "Active" } },
    { new: true }
  )
    .then(user => {
      if (user) {
        req.flash("success", "Your account has been activated!");
        res.redirect("/login");
      } else {
        req.flash("error", "Invalid confirmation code.");
        res.redirect("/login");
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/recover", (req, res, next) => {
  res.render("auth/password-recover", {
    error: req.flash("error")
  });
});

router.post("/recover", (req, res, next) => {
  const { email } = req.body;

  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let resetPasswordCode = "";
  for (let i = 0; i < 25; i++) {
    resetPasswordCode +=
      characters[Math.floor(Math.random() * characters.length)];
  }

  User.findOneAndUpdate(
    { email },
    { $set: { resetPasswordCode: resetPasswordCode } },
    { new: true }
  )
    .then(user => {
      if (user) {
        transporter
          .sendMail({
            from: "ih-feedback.herokuapp.com",
            to: user.email,
            subject: "[FORGOT PASSWORD] Confirm your e-mail",
            html: `Please click <a href="http://localhost:3000/recover/${resetPasswordCode}">here</a>
          `
          })
          .then(info => console.log("nodemailer success -->", info))
          .catch(error => console.log(error));

        req.flash("success", "An e-mail with instruction have been send!");
        res.redirect("/login");
      } else {
        req.flash("error", "E-mail not found.");
        res.redirect("/recover");
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/recover/:resetPasswordCode", (req, res, next) => {
  const { resetPasswordCode } = req.params;

  User.findOne({ resetPasswordCode }, { new: true })
    .then(user => {
      if (user) {
        res.render("auth/password-recover", { code: resetPasswordCode });
      } else {
        req.flash("error", "Invalid confirmation code");
        res.redirect("/login");
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.post("/recover/change-password", (req, res, next) => {
  const { resetPasswordCode, password, passwordCheck } = req.body;

  if (password == "" || passwordCheck == "") {
    res.render("auth/password-recover", {
      error: `Please fill all fields.`,
      code: resetPasswordCode
    });
    return;
  }

  if (password !== passwordCheck) {
    res.render("auth/password-recover", {
      error: `Passwords didn't match.`,
      code: resetPasswordCode
    });
    return;
  }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  User.findOneAndUpdate(
    { resetPasswordCode },
    { $set: { status: "Active", resetPasswordCode: "", password: hashPass } },
    { new: true }
  )
    .then(user => {
      if (user) {
        req.flash("success", "Your password have been reseted.");
        res.redirect("/login");
      } else {
        req.flash("error", "Invalid confirmation code");
        res.redirect("/login");
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

module.exports = router;
