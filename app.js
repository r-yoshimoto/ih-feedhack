require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require("morgan");
const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const passport = require("./services/passport")
const flash = require("connect-flash");

const app = express();


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

app.use(passport)



hbs.registerHelper('ifisDelivered', function(value, options) {
  if(value == "Delivered") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('ifisAnonymous', function(value, options) {
  if(value == "Anonymous") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("select", function(value, options) {
  return options.fn(this)
    .split('\n')
    .map(function(v) {
      var t = 'value="' + value + '"'
      return ! RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
    })
    .join('\n')
})

hbs.registerHelper("check", function(value, test) {
 
  if (value == "Signed"){ return "unchecked" }
  if (value == "Anonymous" || value == undefined){ return "checked"}

})

const siteRoutes = require("./routes/index");
app.use("/", siteRoutes);

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const inboxRoutes = require("./routes/inbox");
app.use("/inbox", inboxRoutes);

module.exports = app;
