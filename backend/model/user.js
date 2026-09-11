const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// console.log(bcrypt)
const jwt = require("jsonwebtoken");

const saltValue = 10
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name!"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email!"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [4, "Password should be greater than 4 characters"],
        select: false,
    },
    addresses: [
        {
            country: { type: String },
            city: { type: String },
            address1: { type: String },
            address2: { type: String },
            zipCode: { type: String },
            addressType: { type: String },
        },
    ],
    role: {
        type: String,
        default: "user",
    },
    avatar: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
});

// Hash password before saving to database
userSchema.pre("save", async function () {
    /* 
    WHILE UPDATING THE RECORD :
    
    It skips re-hashing the password on every save (e.g. when only name or addresses change) by checking if password was actually the field modified.

Returning here just exits the hook early — safe since this is an async pre-save hook, which Mongoose resolves as a promise rather than needing a next() callback.
    */
    if (!this.isModified("password")) {
        return; // async hooks resolve via promise, never call next()
    }
    this.password = await bcrypt.hash(this.password, saltValue);
});


// // Generate JWT token for authentication
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '5d',
    });
};

// // Compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

// console.table(userSchema)
