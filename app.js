require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require("morgan");
const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
// const passport = require("./services/passport")
const app = express();
const flash = require("connect-flash");

app.use(flash());

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });


app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));

// app.use(passport)

const siteRoutes = require("./routes/index");
app.use("/", siteRoutes);

module.exports = app;
