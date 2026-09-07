const express = require("express");
const router = express.Router();
const Shop = require("../model/shop.js");
const { upload } = require("../multer");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const sendShopToken = require("../utils/shopToken.js");
const { isSeller } = require("../middleware/auth.js");
const { uploadToCloudinary } = require("../utils/cloudinary.js");
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
    try {
        const { email } = req.body;

        const sellerEmail = await Shop.findOne({ email });

        if (sellerEmail) {
            return next(new ErrorHandler("User already exist", 400));
        }

        // Guard against a missing file upload: uploadToCloudinary needs a Buffer,
        // and req.file is undefined if the client omitted the multipart field.
        if (!req.file) {
            return next(new ErrorHandler("Avatar image is required", 400));
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `shop-${uniqueSuffix}`;

        const uploadResult = await uploadToCloudinary(req.file.buffer, filename, 'shops');

        const seller = {
            name: req.body.name,
            email: email,
            password: req.body.password,
            avatar: uploadResult.secure_url,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            zipCode: req.body.zipCode
        };

        const activationToken = createActivationToken(seller);
        // Same env-driven client URL as the user flow (controller/user.js).
        // Previously these two controllers pointed at different environments.
        const clientUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const activationUrl = `${clientUrl}/seller/activation/${activationToken}`;

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

// Activate shop user
router.post(
    "/activation",
    catchAsyncErrors(async (req, res, next) => {
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

            // This is where the DB record is actually created — signup only
            // signed a token, it did not persist anything.
            seller = await Shop.create({
                name,
                email,
                password,
                avatar,
                address,
                phoneNumber,
                zipCode
            });

            // Must be sendShopToken, not sendToken: the two helpers differ only in
            // the cookie they set (seller_token vs token). Using sendToken here put a
            // shop id into the *user* cookie, so a freshly activated seller was not
            // logged in as a seller at all.
            sendShopToken(seller, 201, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// login function

router.post(
    "/login-shop",
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(new ErrorHandler("Please enter email and password", 400));
            }

            const user = await Shop.findOne({ email }).select("+password");
            // debugger;

            if (!user) {
                return next(new ErrorHandler("shop not found", 401));
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }

            sendShopToken(user, 200, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// load user 
router.get(
    "/get-seller",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            // we will also try tthe underscore id if we want
            const seller = await Shop.findById(req.seller.id);
            if (!seller) {
                return next(new ErrorHandler("Seller not found", 404));
            }
            res.status(200).json({
                success: true,
                seller: seller,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// logout shop 
router.get("/logout", catchAsyncErrors(async (req, res, next) => {
    try {
        // Attributes must mirror the ones the cookie was set with in
        // utils/shopToken.js, otherwise the browser can keep the original
        // alongside this one instead of replacing it.
        res.cookie("seller_token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}))

//get shop info
router.get(
    "/get-shop-info/:id",
    catchAsyncErrors(async (req, res, next) => {
        try {
            const shop = await Shop.findById(req.params.id);
            res.status(201).json({
                success: true,
                shop,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);


// update seller info
router.put(
    "/update-seller-info",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { name, description, address, phoneNumber, zipCode } = req.body;

            // findById, not findOne: findOne expects a filter *object*. Passing a bare
            // ObjectId gives it no usable query keys, so it degenerated toward findOne({})
            // and returned an arbitrary shop — whose details were then overwritten below.
            const shop = await Shop.findById(req.seller._id);

            if (!shop) {
                return next(new ErrorHandler("User not found", 400));
            }

            shop.name = name;
            shop.description = description;
            shop.address = address;
            shop.phoneNumber = phoneNumber;
            shop.zipCode = zipCode;

            await shop.save();

            res.status(201).json({
                success: true,
                shop,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

module.exports = router;