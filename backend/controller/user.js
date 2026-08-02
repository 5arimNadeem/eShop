const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../model/user.js");
// const ErrorHandler = require("../utils/ErrorHandler.js"); // Fixed capitalization
// const fs = require("fs");
const { upload } = require("../multer");
// const jwt = require("jsonwebtoken");
// const sendEmail = require("../utils/sendMail.js");
// const sendToken = require("../utils/jwtToken.js");
// const catchAsyncError = require("../middleware/catchAsyncErrors.js");
// const { isAuthenticated } = require("../middleware/auth.js");
// const { uploadToCloudinary } = require("../utils/cloudinary.js");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
    const {name, email, password} = req.body 

    const userEmail = await User.findOne({email})

    if(userEmail){
        return next(new ErrorHandler("User Already exists", 400))
    }

    const filename = req.file.filename
    const fileUrl = path.join(filename)

    const user = {
        name : name , 
        email : email, 
        password : password, 
        avatar: fileUrl
    }

    console.log(user)
});


module.exports = router;