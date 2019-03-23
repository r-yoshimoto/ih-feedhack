const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Feedback = require("../models/feedback");
const User = require("../models/users");
const app = express();

app.use(ensureLogin.ensureLoggedIn());

router.get("/", (req, res, next) => {
  res.render("inbox", {
    error: req.flash("error"),
    success: req.flash("success")
  });
});

router.get("/create", (req, res, next) => {
  res.render("feedbacks/new");
});

router.post("/create", (req, res, next) => {
  
  if (req.body.action === "Draft"){
  const { comments, type, hierarchy, to } = req.body;
  const from = req.user._id;

  const newFeedback = new Feedback ({
    comments,
    type,
    hierarchy,
    emailDrafTo: to,
    from,
    status: "Draft"
  })

  newFeedback
    .save()
    .then(feedback => {
      req.flash(
        "success",
        "Your draft has been saved."
      );
      res.redirect("/inbox");
    })
    .catch(err => {
      throw new Error(err);
    });
    return
  }

  const { comments, type, hierarchy, to } = req.body;
  const from = req.user._id;

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
              comments,
              type,
              hierarchy,
              to: userNew._id,
              from,
              status: "Delivered",
            });

            newFeedback
              .save()
              .then(feedback => {
                req.flash(
                  "success",
                  "The user does not exist. But we have storage your feedback."
                );
                res.redirect("/inbox");
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
          comments,
          type,
          hierarchy,
          to: userTo._id,
          from,
          status: "Delivered",
        });

        newFeedback.save().then(feedback => {
          req.flash(
            "success",
            "Your feedback has been send."
          );
          res.redirect("/inbox");
        }).catch(err => {
          throw new Error(err);
        })
      }
    })
    .catch();

})

module.exports = router;
