const express = require("express");
const router = express.Router();
const User = require("../model/user.js");
const ErrorHandler = require("../utils/ErrorHandler.js"); // Fixed capitalization
const { upload } = require("../multer");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail.js");
const sendToken = require("../utils/jwtToken.js");
const catchAsyncError = require("../middleware/catchAsyncErrors.js");
const { isAuthenticated, isAdmin } = require("../middleware/auth.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const { uploadToCloudinary, deleteImagesByUrl } = require("../utils/cloudinary.js");


router.post("/register", upload.single("file"), async (request, response, next) => {
    try {
        const { name, email, password } = request.body;
        if (!request.file) {
            return next(new ErrorHandler("Avatar image is required.", 400));
        }

        const userEmail = await User.findOne({ email });
        if (userEmail) {
            return next(new ErrorHandler("User already exist", 400));
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `user-${uniqueSuffix}`;

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(request.file.buffer, filename, 'users');

        const user = {
            name: name,
            email: email,
            password: password,
            avatar: uploadResult.secure_url, // Use Cloudinary URL
        };

        const activationToken = createActivationToken(user);
        // Env-driven so the link points at whichever frontend is actually running.
        // This was hardcoded to the Vercel host, which made local signup impossible
        // to complete: the emailed link left the machine entirely.
        const clientUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const activationUrl = `${clientUrl}/activation/${activationToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Activate Your account",
                message: `Hello ${user.name},\n\t Please click on the link below to activate your account:\n\n${activationUrl}`,
            });
            response.status(201).json({
                success: true,
                message: `Please check your email:-\n\t${user.email} to activate your account`,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Create activation Token
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
};

// Activate User
router.post(
    "/activation",
    catchAsyncError(async (request, response, next) => {
        try {
            const { activationToken } = request.body;
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

            sendToken(user, 201, response);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// login function

router.post(
    "/login-user",
    catchAsyncError(async (request, response, next) => {
        try {
            const { email, password } = request.body;

            if (!email || !password) {
                return next(new ErrorHandler("Please enter email and password", 400));
            }

            const user = await User.findOne({ email }).select("+password");

            if (!user) {
                return next(new ErrorHandler("User not found", 401));
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }

            sendToken(user, 200, response);
            console.table(request.user)

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// admin login
router.post(
    "/login-admin",
    catchAsyncError(async (request, response, next) => {
        try {
            const { email, password } = request.body;

            if (!email || !password) {
                return next(new ErrorHandler("Please enter email and password", 400));
            }

            const admin = await User.findOne({ email, role: "Admin" }).select("+password");

            // One message for both "no admin with this email" and "wrong password",
            // so this endpoint can't be used to discover which accounts are admins.
            if (!admin) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }

            const isPasswordValid = await admin.comparePassword(password);

            if (!isPasswordValid) {
                return next(new ErrorHandler("Invalid email or password", 401));
            }

            sendToken(admin, 200, response);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

//load user details
router.get(
    "/get-user",
    isAuthenticated,
    catchAsyncErrors(async (request, response, next) => {
        try {
            const user = await User.findById(request.user.id);
            if (!user) {
                return next(new ErrorHandler("User not found", 404));
            }
            response.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

//logout user

router.post(
    "/logout",
    catchAsyncError(async (request, response, next) => {
        try {
            response.cookie("token", null, {
                expires: new Date(Date.now()),
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            });

            response.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

//update user info

router.put("/update-user-info", isAuthenticated, catchAsyncError(async (request, response, next) => {
    try {

        const { email, password, phoneNumber, name } = request.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return next(new ErrorHandler("Invalid password", 401));
        }

        user.name = name;
        user.email = email;
        user.phoneNumber = phoneNumber;

        await user.save();

        response.status(200).json({
            success: true,
            message: "User information updated successfully",
            user,
        });


    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

//update user avatar

router.put("/update-avatar", isAuthenticated, upload.single("image"), catchAsyncError(async (request, response, next) => {

    try {

        const existsUser = await User.findById(request.user.id);
        if (!existsUser) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (!request.file) {
            return next(new ErrorHandler("Avatar image is required.", 400));
        }

        // Clear out the previous avatar. Best-effort — a stale image left in
        // Cloudinary is not worth failing the update over, and pre-Cloudinary
        // avatars are bare local filenames that this simply skips.
        await deleteImagesByUrl([existsUser.avatar]);

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `user-${uniqueSuffix}`;

        const uploadResult = await uploadToCloudinary(request.file.buffer, filename, 'users');

        const user = await User.findByIdAndUpdate(
            request.user.id,
            { avatar: uploadResult.secure_url },
            // { new: true, runValidators: true }
        );

        response.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            user,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));

    }

}))

// update user addresses

router.put("/update-user-addresses", isAuthenticated, catchAsyncError(async (request, response, next) => {
    try {
        const user = await User.findById(request.user.id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const sameTypeAddress = user.addresses.find((address) => address.addressType === request.body.addressType);
        if (sameTypeAddress) {
            return next(new ErrorHandler("Address type already exists", 400));
        }

        const exsistAddress = user.addresses.find((address) => address._id === request.body.id);

        if (exsistAddress) {
            Object.assign(exsistAddress, request.body);

        } else {
            //add the new address to the array'
            user.addresses.push(request.body);
        }

        await user.save();

        response.status(200).json({
            success: true,
            message: "User addresses updated successfully",
            user,
        });




    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}))


// delete user address

router.delete("/delete-user-address/:id", isAuthenticated, catchAsyncError(async (request, response, next) => {

    try {
        const userId = request.user._id;
        const addressId = request.params.id;

        await User.updateOne({
            _id: userId,
        }, {
            $pull: {
                addresses: {
                    _id: addressId,
                },
            },
        })

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        response.status(200).json({
            success: true,
            message: "User address deleted successfully",
            user,
        });


    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

}))


// update user password

router.put("/update-user-password", isAuthenticated, catchAsyncError(async (request, response, next) => {

    try {
        const { oldPassword, newPassword, confirmPassword } = request.body;

        const user = await User.findById(request.user.id).select("+password");

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordValid = await user.comparePassword(oldPassword);

        if (!isPasswordValid) {
            return next(new ErrorHandler("Invalid password", 401));
        }

        if (newPassword !== confirmPassword) {
            return next(new ErrorHandler("New password and confirm password do not match", 400));
        }

        user.password = newPassword;

        await user.save();

        response.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

}));


router.get(
    "/user-info/:id",
    catchAsyncErrors(async (request, response, next) => {
        try {
            const user = await User.findById(request.params.id);

            response.status(201).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);


// all users — admin only
router.get(
    "/admin-all-users",
    isAdmin,
    catchAsyncErrors(async (request, response, next) => {
        try {
            const users = await User.find().sort({ createdAt: -1 });

            response.status(200).json({
                success: true,
                users,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// delete a user — admin only
router.delete(
    "/delete-user/:id",
    isAdmin,
    catchAsyncErrors(async (request, response, next) => {
        try {
            const user = await User.findById(request.params.id);

            if (!user) {
                return next(new ErrorHandler("User not found with this id", 404));
            }

            if (user._id.toString() === request.user._id.toString()) {
                return next(new ErrorHandler("You cannot delete your own admin account", 400));
            }

            await deleteImagesByUrl([user.avatar]);

            await User.findByIdAndDelete(request.params.id);

            response.status(200).json({
                success: true,
                message: "User deleted successfully!",
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);


module.exports = router;
