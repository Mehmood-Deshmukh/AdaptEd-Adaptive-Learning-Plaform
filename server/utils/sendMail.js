const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
const mailTemplates = require('./mailTemplates');
dotenv.config();

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendMail = (to, subject, template, data) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: mailTemplates[template](data)
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
}

module.exports = sendMail;
