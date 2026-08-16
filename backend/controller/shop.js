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
        debugger
        const { email } = req.body;

        const sellerEmail = await Shop.findOne({ email });

        if (sellerEmail) {
            return next(new ErrorHandler("User already exist", 400));
        }
        // if (!req.file) {
        //     return next(new ErrorHandler("Avatar image is required", 400));
        // }

        // Generate unique filename
        if (sellerEmail) {
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
        
        const seller = {
            name: req.body.name,
            email: email,
            password: req.body.password,
            avatar: fileUrl,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            zipCode: req.body.zipCode
        }
        debugger
        
        const activationToken = createActivationToken(seller);
        const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

        try {
            await sendEmail({
                email: seller.email,
                subject: "Activate Your Shop",
                message: `Hello ${seller.name},\n\t Please click on the link below to activate your account:\n\n${activationUrl}`,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email:-\n\t${seller.email} to activate your account`,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

const createActivationToken = (seller) => {
    return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
};

// Activate User
router.post(
    "shop/activation",
    catchAsyncError(async (req, res, next) => {
        try {
            const { activationToken } = req.body;
            const newSeller = jwt.verify(
                activationToken,
                process.env.ACTIVATION_SECRET
            );

            if (!newSeller) {
                return next(new ErrorHandler("Invalid token", 400));
            }

            const { name, email, password, avatar, address, phoneNumber, zipCode } = newSeller;

            let seller = await Shop.findOne({ email });

            if (seller) {
                return next(new ErrorHandler("User already exists", 400));
            }

            seller = await Shop.create({
                name,
                email,
                password,
                avatar,
                address,
                phoneNumber,
                zipCode
            });

            sendToken(seller, 201, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

module.exports = router;