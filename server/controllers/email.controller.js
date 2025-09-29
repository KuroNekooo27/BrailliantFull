const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");
require("dotenv").config();

const {
  ActivationOTP_Template,
  LoginOTP_Template,
  ForgotPasswordOTP_Template,
  EditProfile_Template,
  CreateAccount_Template,
} = require("./EmailTemplate");

const transporter = nodemailer.createTransport(
  sgTransport({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

const FROM_EMAIL = '"Brailliant by Orbit" <brailliant.team@gmail.com>';

const sendLoginOTP = async (otp, email) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Login Verification Code for Brailliant by Orbit",
      text: "Verify your Device",
      html: LoginOTP_Template.replace("{verificationCode}", otp),
    });
  } catch (error) {
    console.error("Login OTP Send Error:", error);
  }
};

const sendForgotPasswordOTP = async (otp, email) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Password Code for Brailliant by Orbit",
      text: "Reset your Password",
      html: ForgotPasswordOTP_Template.replace("{verificationCode}", otp),
    });
  } catch (error) {
    console.error("Forgot Password OTP Send Error:", error);
  }
};

const sendActivationOTP = async (otp, email) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Activation Code for Brailliant by Orbit",
      text: "Activate your Account",
      html: ActivationOTP_Template.replace("{verificationCode}", otp),
    });
  } catch (error) {
    console.error("Activation OTP Send Error:", error);
  }
};

const sendEditEmailOTP = async (otp, email) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Confirmation Code for Brailliant by Orbit",
      text: "Edit your profile",
      html: EditProfile_Template.replace("{verificationCode}", otp).replace(
        "Temporary Password",
        "Change Email OTP"
      ),
    });
  } catch (error) {
    console.error("Edit Email OTP Send Error:", error);
  }
};

const sendCredentials = async (email, password) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "User Credentials for Brailliant by Orbit",
      text: "User Credentials",
      html: CreateAccount_Template.replace("{email}", email).replace(
        "{password}",
        password
      ),
    });
  } catch (error) {
    console.error("Credentials Send Error:", error);
  }
};

const sendEmail = async (req, res) => {
  const { context, otp, email, password } = req.body;

  try {
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
      case "create":
        await sendCredentials(email, password);
        break;
      default:
        console.log("Unknown context:", context);
    }

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("General Send Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { sendEmail };
