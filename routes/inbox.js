const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Feedback = require("../models/feedback");
const User = require("../models/users");
const app = express();

app.use(ensureLogin.ensureLoggedIn());

router.get("/create", (req, res, next) => {
  res.render("feedbacks/new");
});

router.get("/edit/:feedbackId", (req, res, next) => {
  Feedback.findById(req.params.feedbackId)
    .then(feedback => {
      if (feedback.from == req.user.id) {
        res.render("feedbacks/update", {
          feedback: feedback,
          to: feedback.emailDraftTo
        });
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.post("/delete", (req, res, next) => {
  if (req.body._id == null) {
    req.flash("success", "Draft discarded.")
    res.redirect("/inbox");
  } else {
    Feedback.findByIdAndDelete(req.body._id)
      .then(feedback => {
        req.flash("success", "Your Feedback draft has been deleted.");
        res.redirect("/inbox")
      })
      .catch(err => {
        throw new Error(err);
      });
  }
});

router.post("/draft", (req, res, next) => {  
  const { comments, type, hierarchy, to } = req.body;
  const from = req.user._id;
  const id = req.body._id;

  if (id == undefined) {
    const newFeedback = new Feedback({
      comments,
      type,
      hierarchy,
      emailDraftTo: to,
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
      emailDraftTo: to,
      from,
      status: "Draft"
    };

    Feedback.findByIdAndUpdate(
      { _id: id },
      { $set: updateFeedback },
      { new: true }
    )
      .then(feedback => {
        req.flash("success", "Your update has been saved.");
        res.redirect("/inbox");
      })
      .catch();
  }
});

router.post("/send", (req, res, next) => {
  const { comments, hierarchy, to } = req.body;

  req.body.type == null ? (type = "Signed") : (type = "Anonymous");

  if (comments == "" || to == "") {
    req.flash(
      "error",
      "In order to send your feedback we need the recipient and comment to be filled."
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
  const id = req.body._id;

  let newFeedback = new Feedback({
    emailDraftTo: "",
    comments,
    type,
    hierarchy,
    from,
    status: "Delivered"
  });

  Feedback.findById(id)
    .then(feedback => {
      if (feedback == null) {
        User.findOne({ email: to })
          .then(userTo => {
            if (userTo == null) {
              const newUser = new User({
                email: to
              });

              newUser
                .save()
                .then(userNew => {
                  newFeedback.to = userNew._id;

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
              newFeedback.to = userTo._id;
              newFeedback
                .save()
                .then(feedback => {
                  if (userTo.status == "Pending") {
                    req.flash(
                      "success",
                      "The user does not exist. But we have storage your feedback."
                    );
                    res.redirect("/inbox");
                  }

                  req.flash("success", "Your feedback has been send.");
                  res.redirect("/inbox");
                })
                .catch(err => {
                  throw new Error(err);
                });
            }
          })
          .catch();
      } else {
        User.findOne({ email: to })
          .then(userTo => {
            if (userTo == null) {
              const newUser = new User({
                email: to
              });

              newUser
                .save()
                .then(userNew => {
                  newFeedback.to = userNew._id;

                  Feedback.findByIdAndUpdate(
                    { _id: id },
                    { $set: newFeedback },
                    { new: true }
                  )
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
              (newFeedback.to = userTo._id),
                Feedback.findByIdAndUpdate(
                  { _id: id },
                  { $set: newFeedback },
                  { new: true }
                )
                  .then(feedback => {
                    if (userTo.status == "Pending") {
                      req.flash(
                        "success",
                        "The user does not exist. But we have storage your feedback."
                      );
                      res.redirect("/inbox");
                    }

                    req.flash("success", "Your feedback has been send.");
                    res.redirect("/inbox");
                  })
                  .catch(err => {
                    throw new Error(err);
                  });
            }
          })
          .catch();
      }
    })
    .catch();
});

//Bruno

router.get("/", (req, res, next) => {
  var currentUser = req.user._id;
  Feedback.find({
    $and: [
      { to: currentUser },
      { toDiscardedStatus: false },
      {
        $or: [
          { status: "Delivered" },
          { status: "Accepted" },
          { status: "Read" }
        ]
      }
    ]
  })
    .populate("from")
    .then(feedback => {
    
      if (feedback.length == 0) {
        req.session.counter = false;
      } else if (feedback.length < 10) {
        req.session.counter = feedback.length;
      } else {
        req.session.counter = "●";
      }
      
      res.locals.counter = req.session.counter

      res.render("inbox", {
        feedback: feedback,
        error: req.flash("error"),
        success: req.flash("success")
         });


    })
    .catch(error => {
      console.log(error);
    });
});

router.post("/discard", (req, res, next) => {
  let feedbackId = req.body.id;
  Feedback.findByIdAndUpdate(
    { _id: feedbackId },
    { $set: { toDiscardedStatus: true } }
  )
    .then(feedback => {
      res.redirect("/inbox");
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.post("/accept", (req, res, next) => {
  let feedbackId = req.body.id;
  Feedback.findByIdAndUpdate(
    { _id: feedbackId },
    { $set: { status: "Accepted" } }
  )
    .then(feedback => {
      res.redirect("/inbox");
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.post("/refuse", (req, res, next) => {
  let feedbackId = req.body.id;
  Feedback.findByIdAndUpdate(
    { _id: feedbackId },
    { $set: { status: "Refused" } }
  )
    .then(feedback => {
      res.redirect("/inbox");
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/outbox", (req, res, next) => {
  var currentUser = req.user._id;
  Feedback.find({
    $and: [
      { from: currentUser },
      { fromDiscardedStatus: false },
      {
        $or: [
          { status: "Delivered" },
          { status: "Accepted" },
          { status: "Refused" },
          { status: "Read" }
        ]
      }
    ]
  })
    .populate('to')
    .then(feedback => {
      // res.send(feedback);
      res.render("outbox", { feedback: feedback,
        error: req.flash("error"),
        success: req.flash("success")
         });
    })
    .catch(error => {
      console.log(error);
    });
});



router.post("/outbox/discard", (req, res, next) => {
  let feedbackId = req.body.id;
  Feedback.findByIdAndUpdate(
    { _id: feedbackId },
    { $set: { fromDiscardedStatus: true } }
  )
    .then(feedback => {
      res.redirect("/inbox/outbox");
    })
    .catch(err => {
      throw new Error(err);
    });
});


router.get("/outbox/:feedbackId", (req, res, next) => {
  Feedback.findById(req.params.feedbackId)
    .populate('to')
    .then(feedback => {
      if (feedback.from == req.user.id) {
        
        res.render("feedbacks/detail-outbox", {
          feedback: feedback,
          to: feedback.emailDraftTo
        });
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/draft", (req, res, next) => {
  var currentUser = req.user._id;
  Feedback.find({
    $and: [
      { from: currentUser },
      { fromDiscardedStatus: false },
      { status: "Draft" }
    ]
  })
    .populate('to')
    .then(feedback => {
      // res.send(feedback);
      res.render("draft", { feedback: feedback,
        error: req.flash("error"),
        success: req.flash("success")
         });
    })
    .catch(error => {
      console.log(error);
    });
});


router.get("/:feedbackId", (req, res, next) => {
  let feedbackId = req.params.feedbackId;
  Feedback.findByIdAndUpdate(
    { _id: feedbackId },
    { $set: { status: "Read" } }
    )
    .then(feedback => {
      if (feedback.to == req.user.id) {
        res.render("feedbacks/detail", {
          feedback: feedback,
          to: feedback.emailDrafTo
        });
      }
    })
    .catch(err => {
      throw new Error(err);
    });
});






module.exports = router;
