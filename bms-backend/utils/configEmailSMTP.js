const nodemailer = require('nodemailer');

const indiaTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
    },
});

function sendIndiaMail(mailOptions) {
    return new Promise((resolve, reject) => {
        indiaTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                reject({ error: error?.message, status: false });
            } else {
                console.log('Email sent successfully:', info.messageId);
                resolve({ status: true, info });
            }
        });
    });
}

module.exports = { sendIndiaMail };
