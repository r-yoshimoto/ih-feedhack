const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD 
  }
});

module.exports = transporter;