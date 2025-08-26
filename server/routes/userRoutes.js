const express = require('express');
const { registerController, loginController, updateUserController, requireSignIn, verifyLoginOtpController , activateUserController, verifyActivationCodeController, sendOtpForEditController , verifyEditOtpController, sendForgotPasswordOtpController, verifyForgotPasswordOtpAndSendTempPasswordController} = require('../controllers/userController');

//router object
const router = express.Router();

//routes
// REGISTER
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

// UPDATE
router.put("/update", requireSignIn, updateUserController);


// LOGIN OTP VERIFICATION
router.post("/verify-login-otp", verifyLoginOtpController);

// SEND ACTIVATION CODE
router.post("/activate", activateUserController);

// VERIFY ACTIVATION CODE
router.post("/activate-otp", verifyActivationCodeController);

// SEND EDIT OTP
router.post('/send-otp-for-edit', sendOtpForEditController);

// VERIFY EDIT OTP
router.post('/verify-edit', verifyEditOtpController);

// FORGOT PASSWORD: Send OTP
router.post('/forgot-password', sendForgotPasswordOtpController);

// FORGOT PASSWORD: Verify OTP and Reset Password
router.post('/verify-forgot-otp', verifyForgotPasswordOtpAndSendTempPasswordController);


//export
module.exports = router;
