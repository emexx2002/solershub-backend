// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')

class Email{
    constructor(API_KEY, mailto) {
        this.API_KEY = API_KEY
        this.mailto = mailto
    } 
    sendWelcome(subject) {
        sgMail.setApiKey(this.API_KEY)
        to = this.mailto
        from = 'solershub@gmail.com'
        subject = "Welcome!"
        text = 'Congratulations on creating an account with SolersHub'
        html = ''
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