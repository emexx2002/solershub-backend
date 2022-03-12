// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require("@sendgrid/mail");

class Email {
  constructor(API_KEY, mailto) {
    this.API_KEY = API_KEY;
    this.mailto = mailto;
    this.mailfrom = "0x7lol@gmail.com";
  }
  async sendWelcome(url) {
    try {
      sgMail.setApiKey(this.API_KEY);
      const msg = {
        to: this.mailto,
        from: this.mailfrom,
        subject: "Welcome!",
        text: "Congratulations on creating an account with SolersHub. \
                Please, confirm your mail here.",
      };
      await sgMail.send(msg);
      console.log("EMAIL SENT SUCCESSFULLY");
    } catch (err) {
      console.log("AN ERROR OCCURED WHILE SENDING MAIL", err.response);
    }
  }

  async sendPasswordReset(url, time) {
    try {
      sgMail.setApiKey(this.API_KEY);
      const msg = {
        to: this.mailtofrom,
        from: this.mailfrom,
        subject: "Password reset link",
        text: `Here's the link to reset your password-${url}. Expires in ${time} minutes`,
      };
      await sgMail.send(msg);
      console.log("EMAIL SENT SUCCESSFULLY");
    } catch (err) {
      console.log("AN ERROR OCCURED WHILE SENDING MAIL", err.response);
    }
  }
}

module.exports = Email;
