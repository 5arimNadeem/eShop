const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Shop = require("../model/shop.js");
const { upload } = require("../multer");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail.js");
const sendToken = require("../utils/jwtToken.js");
const catchAsyncError = require("../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { isAuthenticated } = require("../middleware/auth.js")
// const sendShopToken = require("../utils/shopToken.js");
// const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
// const { isSeller } = require("../middleware/auth.js");
// const { uploadToCloudinary } = require("../utils/cloudinary.js");
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
    try {
        console.log("[DEBUG] /create-shop hit — body:", req.body);
        console.log("[DEBUG] /create-shop file:", req.file ? req.file.filename : "NO FILE");

        const { email } = req.body;

        // 🔍 CHECKPOINT 1: Is the email already registered?
        const sellerEmail = await Shop.findOne({ email });
        console.log("[DEBUG] sellerEmail found:", sellerEmail ? "YES - rejecting" : "NO - continuing");

        if (sellerEmail) {
            return next(new ErrorHandler("User already exist", 400));
        }

        // 🔍 CHECKPOINT 2: Guard against missing file upload
        if (!req.file) {
            console.log("[DEBUG] No file uploaded — returning error");
            return next(new ErrorHandler("Avatar image is required", 400));
        }

        const filename = req.file.filename;
        const fileUrl = path.join(filename);
        console.log("[DEBUG] File uploaded successfully:", fileUrl);

        const seller = {
            name: req.body.name,
            email: email,
            password: req.body.password,
            avatar: fileUrl,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            zipCode: req.body.zipCode
        };

        // 🔍 CHECKPOINT 3: Building activation token
        const activationToken = createActivationToken(seller);
        const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;
        console.log("[DEBUG] Activation URL created — sending email to:", seller.email);

        try {
            await sendEmail({
                email: seller.email,
                subject: "Activate Your Shop",
                message: `Hello ${seller.name},\n\t Please click on the link below to activate your account:\n\n${activationUrl}`,
            });
            console.log("[DEBUG] Email sent successfully");
            res.status(201).json({
                success: true,
                message: `Please check your email:-\n\t${seller.email} to activate your account`,
            });
        } catch (error) {
            console.log("[DEBUG] Email sending FAILED:", error.message);
            return next(new ErrorHandler(error.message, 500));
        }
    } catch (error) {
        console.log("[DEBUG] Outer catch error:", error.message);
        return next(new ErrorHandler(error.message, 400));
    }
});

const createActivationToken = (seller) => {
    return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
};

// Activate shop user
router.post(
    "/activation",
    catchAsyncError(async (req, res, next) => {
        try {
            console.log("[DEBUG] /shop/activation hit");
            const { activationToken } = req.body;

            const newSeller = jwt.verify(
                activationToken,
                process.env.ACTIVATION_SECRET
            );

            if (!newSeller) {
                return next(new ErrorHandler("Invalid token", 400));
            }

            const { name, email, password, avatar, address, phoneNumber, zipCode } = newSeller;
            console.log("[DEBUG] Token decoded — email:", email);

            let seller = await Shop.findOne({ email });
            if (seller) {
                return next(new ErrorHandler("User already exists", 400));
            }

            // 🔍 CHECKPOINT 4: THIS is where the DB record is created
            console.log("[DEBUG] Creating seller in DB...");
            seller = await Shop.create({
                name,
                email,
                password,
                avatar,
                address,
                phoneNumber,
                zipCode
            });
            console.log("[DEBUG] Seller created in DB — ID:", seller._id);

            sendToken(seller, 201, res);
        } catch (error) {
            console.log("[DEBUG] Activation catch error:", error.message);
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

module.exports = router;