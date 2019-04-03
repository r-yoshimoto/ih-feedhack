const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/feedback", (req, res, next) => {

  if (req.query.tokenId == undefined) {

    res.render("feedbacks/token")
    return
  }

  Feedback.findOneAndUpdate({token: req.query.tokenId}, { $set: { status: "Read" } })
    .then(feedback => {
        res.render("feedbacks/detail", {
          feedback: feedback,
          token: true,
        });
      
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.post("/feedback/read", (req, res, next) => {
  let feedbackId = req.body.id;
  Feedback.findByIdAndUpdate(
    { _id: feedbackId },
    { $set: { status: "Read" } }
  )
    .then(feedback => {
      req.flash("success", "The Feedback has been marked as read.")
      res.redirect("/login");
    })
    .catch(err => {
      throw new Error(err);
    });

})

module.exports = router;
