// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')

class Email{
    constructor(API_KEY, mailto) {
        this.API_KEY = API_KEY
        this.mailto = mailto
        this.mailfrom = this.mailfrom
    } 
    sendWelcome(subject, url) {
        sgMail.setApiKey(this.API_KEY)
        to = this.mailto
        from = this.mailfrom
        subject = "Welcome!"
        text = 'Congratulations on creating an account with SolersHub. \
        Please, confirm your mail here.'
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
    sendPasswordReset(url, time) {
        sgMail.setApiKey(this.API_KEY)
        to = this.mailtofrom
        from = this.mailfrom
        subject = "Password reset link"
        html = "Here's the link to reset your password."
        sgMail        
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

module.exports = Email