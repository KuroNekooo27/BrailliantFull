const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First Name is required"],
        trim: true, 
    },
    lastname: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        maxlength: 64
    },
    role: {
        type: String,
        default: "user",
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    loginOtpCode: {
        type: String,
        default: null,
    },
    activationCode: {
        type: String,
        default: null,
    },
    genericOTP: {
        type: String,
        default: null,
    }

},
    {timestamps: true}
);  

/*
const User = mongoose.model("User", userSchema);

module.exports = User;
*/