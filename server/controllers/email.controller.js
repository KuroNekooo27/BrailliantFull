const nodemailer = require('nodemailer');
require('dotenv').config();

const { ActivationOTP_Template, LoginOTP_Template, ForgotPasswordOTP_Template, EditProfile_Template } = require('./EmailTemplate');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false 
    },
});

const sendLoginOTP = async (otp, email) => {
    try {
        const info = await transporter.sendMail({
            from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
            to: email,
            subject: "Login Verification Code for Brailliant by Orbit",
            text: "Verify your Device",
            html: LoginOTP_Template.replace("{verificationCode}", otp),
        });
        console.log(otp)
    } catch (error) {
        console.log("Verification Send Error", error);
    }
}

const sendForgotPasswordOTP = async (otp, email) => {
    try {
        const info = await transporter.sendMail({
            from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
            to: email,
            subject: "Reset Password Code for Brailliant by Orbit",
            text: "Reset your Password",
            html: ForgotPasswordOTP_Template.replace("{verificationCode}", otp),
        });
        console.log(otp)
    } catch (error) {
        console.log("Verification Send Error", error);
    }
}

const sendActivationOTP = async (otp, email) => {
    try {
        const info = await transporter.sendMail({
            from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
            to: email,
            subject: "Activation Code for Brailliant by Orbit",
            text: "Activate your Account",
            html: ActivationOTP_Template.replace("{verificationCode}", otp),
        });
        console.log(otp)
    } catch (error) {
        console.log("Verification Send Error", error);
    }
}

const sendEmail = async (req, res) => {
    const { context, otp, email } = req.body;

    switch (context) {
        case "login": sendLoginOTP(otp, email)
        case "forgotPassword": sendForgotPasswordOTP(otp, email)
        case "activate": sendActivationOTP(otp, email)
    }
};

module.exports = { sendEmail };
