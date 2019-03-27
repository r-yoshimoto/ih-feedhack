const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Feedback = require("../models/feedback");
const User = require("../models/users");
const app = express();

app.use(ensureLogin.ensureLoggedIn());

// router.get("/", (req, res, next) => {
//   res.render("inbox", {
//     error: req.flash("error"),
//     success: req.flash("success")
//   });
// });

router.get("/create", (req, res, next) => {
  res.render("feedbacks/new");
});

router.get("/edit/:feedbackId", (req, res, next) => {
  Feedback.findById(req.params.feedbackId)
    .then(feedback => {
      if (feedback.from == req.user.id) {
        res.render("feedbacks/update", { feedback: feedback, to: feedback.emailDrafTo});
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.post("/create", (req, res, next) => {
  if (req.body.action === "Draft") {
    const { comments, type, hierarchy, to } = req.body;
    const from = req.user._id;
    const id = req.body._id;

    if (id == undefined) {
      const newFeedback = new Feedback({
        comments,
        type,
        hierarchy,
        emailDrafTo: to,
        from,
        status: "Draft"
      });

      newFeedback
        .save()
        .then(feedback => {
          req.flash("success", "Your draft has been saved.");
          res.redirect("/inbox");
        })
        .catch(err => {
          throw new Error(err);
        });
      return;
    } else {
      const updateFeedback = {
        comments,
        type,
        hierarchy,
        to,
        from,
        status: "Draft"
      };

      Feedback.findByIdAndUpdate(
        { _id: req.user._id },
        { $set: updateFeedback },
        { new: true }
      )
        .then(feedback => {
          req.flash("success", "Your draft has been saved.");
          res.redirect("/inbox");
        })
        .catch();
    }
  }

  const { comments, hierarchy, to } = req.body;

  req.body.type == null ? (type = "Signed") : (type = "Anonymous");

  if (comments == "" || to == "") {
    req.flash(
      "error",
      "In order to send your feedback we need a that the recipient and comment to be filled."
    );

    res.render("feedbacks/new", {
      error: req.flash("error"),
      comments,
      type,
      hierarchy,
      to
    });

    return;
  }

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
              status: "Delivered"
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
          status: "Delivered"
        });

        newFeedback
          .save()
          .then(feedback => {
            req.flash("success", "Your feedback has been send.");
            res.redirect("/inbox");
          })
          .catch(err => {
            throw new Error(err);
          });
      }
    })
    .catch();
});

//Bruno

router.get("/", (req, res, next) => {
  var currentUser = req.user._id;
  Feedback.find({ $and: [{to: currentUser}, {toDiscardedStatus: false}, { $or :[{status: "Delivered"}, {status:"Accepted"}, {status:"Read"}]}]})
    .populate('from')
    .then(feedback =>{
      // res.send(feedback);
      res.render("inbox", {feedback: feedback});
    })
    .catch(error => {
			console.log(error);
		});
	
})

// router.get("/:feedbackId", (req, res, next) => {
//   Feedback.findById(req.params.feedbackId)
//     .then(feedback => {
//       if (feedback.to == req.user.id) {
//         res.render("feedbacks/view", { feedback: feedback, to: feedback.emailDrafTo});
//       }
//     })
//     .catch(err => {
//       throw new Error(err);
//     });
// });


module.exports = router;
