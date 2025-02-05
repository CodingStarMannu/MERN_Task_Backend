const nodemailer = require("nodemailer");
require("dotenv").config();


const sendMail = async (email, mailSubject, content) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: mailSubject,
      html: content,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendMail;