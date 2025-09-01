require('dotenv').config();
const JWT = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../helpers/authHelper');
const User = require("../models/user.model")
const nodemailer = require('nodemailer');

const { ActivationOTP_Template, LoginOTP_Template, ForgotPasswordOTP_Template, TempPassword_Template, EditProfile_Template } = require('./EmailTemplate');

var { expressjwt: jwt } = require("express-jwt");

// middleware
const requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Add this line
  },
});


//emails-----------------------------------------

// SEND TEMPORARY PASSWORD
const sendTemporaryPassword = async (email, temporaryPassword) => {
  try {
    const info = await transporter.sendMail({
      from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
      to: email,
      subject: "Your Temporary Password for Brailliant by Orbit",
      text: `Your temporary password is: ${temporaryPassword}`, // plain-text body
      // Assuming you have a TemporaryPassword_Template defined similarly
      // If not, you can just use the 'text' property for now or create the template.
      html: TempPassword_Template.replace("{verificationCode}", temporaryPassword), // HTML body
    });
    console.log("Temporary password sent successfully.");
  } catch (error) {
    console.log("Temporary Password Send Error", error);
  }
}

//Send login verification email
const sendResetOTPcode = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
      to: email,
      subject: "Reset Password Code for Brailliant by Orbit",
      text: "Reset your Password", // plain‑text body
      html: ForgotPasswordOTP_Template.replace("{verificationCode}", otp), // HTML body
    });
    console.log(otp)
  } catch (error) {
    console.log("Verification Send Error", error);
  }
}

//Send login verification email
const sendLoginVerificationCode = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
      to: email,
      subject: "Login Verification Code for Brailliant by Orbit",
      text: "Verify your Device", // plain‑text body
      html: LoginOTP_Template.replace("{verificationCode}", otp), // HTML body
    });
    console.log(otp)
  } catch (error) {
    console.log("Verification Send Error", error);
  }
}

//Send edit verification otp
const sendEditVerificationCode = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
      to: email,
      subject: "Confirmation Code for Brailliant by Orbit",
      text: "Edit your profile", // plain‑text body
      html: EditProfile_Template.replace("{verificationCode}", otp), // HTML body
    });
    console.log(otp)
  } catch (error) {
    console.log("Verification Send Error", error);
  }
}

//SEND ACTIVATIVATION CODE 
const sendActivationCode = async (email, activationCode) => {
  try {
    const info = await transporter.sendMail({
      from: '"Brailliant by Orbit" <mavyorbit@gmail.com>',
      to: email,
      subject: "Activation Code for Brailliant by Orbit",
      text: "Activate your Account", // plain‑text body
      html: ActivationOTP_Template.replace("{verificationCode}", activationCode), // HTML body
    });
  } catch (error) {
    console.log("Activation Send Error", error);
  }
}

//------------------------------------------------------------------------------------


//REGISTER 
const registerController = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body
    //validation
    if (!firstname) {
      return res.status(400).send({
        success: false,
        message: "First name is required"
      })
    }
    if (!lastname) {
      return res.status(400).send({
        success: false,
        message: "Last name is required"
      })
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required"
      })
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password is required and must be at least 6 characters long"
      })
    }
    //existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "User already exists"
      })
    }

    //hashed password
    const hashedPassword = await hashPassword(password);

    //save new user
    const user = await User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    }).save();

    return res.status(201).send({
      success: true,
      message: "User created successfully"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    })
  }
};

//LOGIN
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ user_email: email })

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    await console.log(user.user_password)
    const match = await comparePassword(password, user.user_password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    // generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtpCode = otp; // Save OTP to the user document
    await user.save();
    sendLoginVerificationCode(user.user_email, otp);
    return res.status(200).send({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      otpSent: true,
      userId: user._id, // front-end can keep this to verify later
    });

  } catch (error) {
    console.error("Login error", error);
    return res.status(500).send({
      success: false,
      message: "Error during login",
      error,
    });
  }
};


//UPDATE
const updateUserController = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    //find user
    const user = await User.findOne({ user_email: email });
    //validation
    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password is required and must be at least 6 characters long"
      })
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;


    const updatedUser = await User.findOneAndUpdate({ user_email: email }, {
      user_fname: firstname || user.user_fname,
      user_lname: lastname || user.user_lname,
      user_password: hashedPassword || user.user_password
    }, { new: true });
    updatedUser.user_password = undefined;
    res.status(201).send({
      success: true,
      message: "User updated successfully! Please login again",
      updatedUser,
    })

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in update",
      error,
    })
  }
}

//login OTP verification
const verifyLoginOtpController = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById({ _id: userId });
    if (!user || user.loginOtpCode !== otp) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }
    user.loginOtpCode = undefined; // Clear the verification code after successful verification
    await user.save();

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log("OTP verification error", error);
    return res.status(500).send({
      success: false,
      message: "Error verifying OTP",
      error,
    });
  }
};

//ACTIVATE USER
const activateUserController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ user_email: email }); // ✅ FIXED LINE
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    if (user.isActivated) {
      return res.status(400).send({
        success: false,
        message: "User already activated",
      });
    }

    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.activationCode = activationCode;
    await user.save();
    sendActivationCode(user.user_email, activationCode);

    return res.status(200).send({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      otpSent: true,
      userId: user._id,
    });

  } catch (error) {
    console.error("Activation error", error);
    return res.status(500).send({
      success: false,
      message: "Error during activation",
      error,
    });
  }
};


//VERIFT ACTIVATION CODE
const verifyActivationCodeController = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById({ _id: userId });
    if (!user || user.activationCode !== otp) {
      return res.status(400).send({
        success: false,
        message: "Invalid Activation Code",
      });
    }

    user.isActivated = true;
    user.activationCode = undefined; // Clear the activation code after successful activation
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Account successfully activated",
      user,
    });
  } catch (error) {
    console.log("Activation verification error", error);
    return res.status(500).send({
      success: false,
      message: "Error verifying activation code",
      error,
    });
  }
};

// Send OTP for profile update
const sendOtpForEditController = async (req, res) => {
  try {
    const { email, userID } = req.body;
    const user = await User.findOne({ userID });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.genericOTP = otp;
    await user.save();
    sendEditVerificationCode(email, otp);
    return res.status(200).send({
      success: true,
      message: "OTP sent for update verification",
      otpSent: true,
      userId: user._id,
    });
  } catch (error) {
    console.error("Update OTP send error", error);
    return res.status(500).send({ success: false, message: "OTP sending failed", error });
  }
};

// Verify OTP for update
const verifyEditOtpController = async (req, res) => {
  try {
    const {
      userID,
      otp,
      firstname,
      email,
      lastname,
      currentPassword,
      newPassword
    } = req.body;

    const user = await User.findById({ _id: userID });
    if (!user || user.genericOTP !== otp) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Handle password update securely
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).send({
          success: false,
          message: "Current password is required to change password"
        });
      }

      const isMatch = await comparePassword(currentPassword, user.user_password);
      if (!isMatch) {
        return res.status(401).send({
          success: false,
          message: "Current password is incorrect"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).send({
          success: false,
          message: "New password must be at least 6 characters"
        });
      }

      user.user_password = await hashPassword(newPassword);
    }

    user.firstname = firstname || user.user_fname;
    user.lastname = lastname || user.user_lname;
    user.email = email || user.user_email;
    user.genericOTP = undefined;

    await user.save();

    user.user_password = undefined;
    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update verify error", error);
    return res.status(500).send({
      success: false,
      message: "Update failed",
      error,
    });
  }
};

//FORGOT PASSWORD OTP
const sendForgotPasswordOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ user_email: email });

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.genericOTP = otp;
    await user.save();

    sendResetOTPcode(user.user_email, otp);

    return res.status(200).send({
      success: true,
      message: "OTP sent to email for password reset",
      otpSent: true,
      userId: user._id,
    });
  } catch (error) {
    console.error("Forgot Password OTP send error", error);
    return res.status(500).send({
      success: false,
      message: "Failed to send OTP",
      error,
    });
  }
};

//VERIFY FORGOTPASSWORD OTP
const verifyForgotPasswordOtpAndSendTempPasswordController = async (req, res) => {
  try {
    const { userId, otp } = req.body; // newPassword is NOT expected from frontend anymore here

    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    if (user.genericOTP !== otp) { // Make sure to implement OTP expiration!
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Generate a temporary password (e.g., 8 random alphanumeric characters)
    const temporaryPassword = Math.random().toString(36).slice(-8);

    // Hash the temporary password
    const hashedPassword = await hashPassword(temporaryPassword);

    // Update user's password and clear the OTP
    user.user_password = hashedPassword;
    user.genericOTP = undefined; // Clear the OTP
    // user.otpExpiresAt = undefined; // Also clear OTP expiration if you add it

    await user.save();

    // Send the temporary password to the user's email
    await sendTemporaryPassword(user.user_email, temporaryPassword);

    return res.status(200).send({
      success: true,
      message: "Password reset successful. A temporary password has been sent to your email.",
      // Do NOT send the temporaryPassword in the response here for security reasons.
      // The frontend only needs to know it was successful and that an email was sent.
    });
  } catch (error) {
    console.error("Forgot Password OTP verification and temporary password generation error", error);
    return res.status(500).send({
      success: false,
      message: "Failed to reset password. Please try again.",
      error: error.message, // Send error message for debugging
    });
  }
};




module.exports = {
  registerController,
  loginController,
  updateUserController,
  requireSignIn,
  verifyLoginOtpController,
  activateUserController,
  verifyActivationCodeController,
  verifyEditOtpController,
  sendOtpForEditController,
  sendForgotPasswordOtpController,
  verifyForgotPasswordOtpAndSendTempPasswordController,
};

