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
  .populate('from')  
  .then(feedback => {
        res.render("feedbacks/detail", {
          feedback: feedback,
          tokenWeb: true,
        });
      
    })
    .catch(err => {
      throw new Error(err);
    });
});


module.exports = router;
