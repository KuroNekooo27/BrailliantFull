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

const sendEditEmailOTP = async (otp, email) => {
    try {
        const info = await transporter.sendMail({
            from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
            to: email,
            subject: "Confirmation Code for Brailliant by Orbit",
            text: "Edit your profile",
            html: EditProfile_Template.replace("{verificationCode}", otp).replace("Temporary Password", "Change Email OTP"), 
        });
    } catch (error) {
        console.log("Verification Send Error", error);
    }
}

const sendEmail = async (req, res) => {
    const { context, otp, email } = req.body;

    switch (context) {
        case "login":
            await sendLoginOTP(otp, email);
            break;
        case "forgotPassword":
            await sendForgotPasswordOTP(otp, email);
            break;
        case "activate":
            await sendActivationOTP(otp, email);
            break;
        case "edit":
            await sendEditEmailOTP(otp, email);
            break;
        default:
            console.log("Unknown context:", context);
    }

    res.status(200).json({ success: true, message: "Email sent" });
};


module.exports = { sendEmail };
