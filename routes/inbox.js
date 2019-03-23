const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Feedback = require("../models/feedback");
const User = require("../models/users");

app.use(ensureLogin.ensureLoggedIn());

router.get("/", (req, res, next) => {
  res.render("inbox", {
    error: req.flash("error"),
    success: req.flash("success")
  });
});

router.get("/create", (req, res, next) => {
  res.render("feedack/new");
});

router.post("/create", (req, res, next) => {
  const { comment, type, hierarchy, to } = req.body;
  const from = req.user_id;

  User.findOne({ email: to })
    .then(userTo => {
      if (userTo == null) {
        const newUser = new User({
          email: to
        });

        newUser
          .save()
          .then(userNew => {
            const newFeedback = new Feedback({
              comment,
              type,
              hierarchy,
              to: userNew._id,
              from
            });

            newFeedback
              .save()
              .then(feedback => {
                req.flash(
                  "success",
                  "The user does not exist. But we have storage your feedback."
                );
                req.redirect("/inbox");
              })
              .catch(err => {
                throw new Error(err);
              });
          })
          .catch(err => {
            throw new Error(err);
          });
      } else {
        const newFeedback = new Feedback({
          comment,
          type,
          hierarchy,
          to: userTo._id,
          from
        });

        newFeedback.save().then(feedback => {
          req.flash(
            "success",
            "Your feedback has been send."
          );
          req.redirect("/inbox");
        }).catch(err => {
          throw new Error(err);
        })
      }
    })
    .catch();
});

module.exports = router;
