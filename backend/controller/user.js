const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../model/user.js");
const ErrorHandler = require("../utils/ErrorHandler.js"); // Fixed capitalization
const { upload } = require("../multer.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail.js");
const sendToken = require("../utils/jwtToken.js");
const catchAsyncError = require("../middleware/catchAsyncErrors.js");
const { isAuthenticated } = require("../middleware/auth.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
// const { isAuthenticated } = require("../middleware/auth.js");
// const { uploadToCloudinary } = require("../utils/cloudinary.js");

router.post("/create-user", upload.single("file"), async (req, res, next) => {

    try {
        const { name, email, password } = req.body

        const userEmail = await User.findOne({ email })

        if (userEmail) {
            const filename = req.file.filename
            const filePath = `uploads/${filename}`
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({ message: "Error Deleting file" })
                }
                return next(new ErrorHandler("User Already exists", 400))
            })
        }
        const filename = req.file.filename
        const fileUrl = path.join(filename)

        const user = {
            name: name,
            email: email,
            password: password,
            avatar: fileUrl
        }
        // console.log(user)
        // throw new Error("Testing")

        const activationToken = createActivationToken(user)
        const activationUrl = `http://localhost:3000/activation/${activationToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Activate Your account",
                message: `Hello ${user.name},\n\t Please click on the link below to activate your account:\n\n${activationUrl}`,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email:-\n\t${user.email} to activate your account`,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500))
        }

    } catch (error) {
        return next(new ErrorHandler(error.message), 400)
    }



});

const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
};

// Activate User
router.post(
    "/activation",
    catchAsyncError(async (req, res, next) => {
        try {
            const { activationToken } = req.body;
            const newUser = jwt.verify(
                activationToken,
                process.env.ACTIVATION_SECRET
            );

            if (!newUser) {
                return next(new ErrorHandler("Invalid token", 400));
            }

            const { name, email, password, avatar } = newUser;

            let user = await User.findOne({ email });

            if (user) {
                return next(new ErrorHandler("User already exists", 400));
            }

            user = await User.create({
                name,
                email,
                password,
                avatar,
            });

            sendToken(user, 201, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// login user 

// login function

router.post(
    "/login-user",
    catchAsyncError(async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(new ErrorHandler("Please enter email and password", 400));
            }

            const user = await User.findOne({ email }).select("+password");
            // debugger;

            if (!user) {
                return next(new ErrorHandler("User not found", 401));
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }

            sendToken(user, 200, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// load user 
router.get(
    "/get-user",
    isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return next(new ErrorHandler("User not found", 404));
            }
            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

router.get("/logout", catchAsyncError(async (req, res, next) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}))

module.exports = router;