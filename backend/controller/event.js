const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop.js");
const Event = require("../model/event.js");
const router = express.Router();
const { upload } = require("../multer");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const { uploadToCloudinary, deleteImagesByUrl } = require("../utils/cloudinary.js");

// create product 

router.post("/create-event", isSeller, upload.array("images"), catchAsyncErrors(async (req, res, next) => {
    try {
        const shopId = req.body.shopId;
        const shop = await Shop.findById(shopId);

        if (!shop) {
            return next(new ErrorHandler("Shop not found", 404));
        } else {
            const files = req.files;

            if (!files || files.length === 0) {
                return next(new ErrorHandler("Please upload at least one image", 400));
            }

            const imageUrls = [];
            for (let i = 0; i < files.length; i++) {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const filename = `event-${uniqueSuffix}-${i}`;

                try {
                    const uploadResult = await uploadToCloudinary(files[i].buffer, filename, 'events');
                    imageUrls.push(uploadResult.secure_url);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    return next(new ErrorHandler("Failed to upload image to cloud storage", 500));
                }
            }

            const eventData = req.body
            eventData.images = imageUrls
            eventData.shop = shop

            const event = await Event.create(eventData);

            res.status(201).json({
                success: true,
                event,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}));

//get all events 

router.get("/get-all-events", catchAsyncErrors(async (req, res, next) => {
    try {
        const events = await Event.find();

        res.status(200).json({
            success: true,
            events: events.length > 0 ? events : [],
            message: events.length > 0 ? undefined : "No events found for this shop",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// get all events of a specific shop

router.get("/get-all-events/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        const events = await Event.find({ shopId: req.params.id });

        res.status(200).json({
            success: true,
            events,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// delete event of a shop 

router.delete("/delete-shop-event/:id", isSeller, catchAsyncErrors(async (req, res, next) => {
    try {
        const eventId = req.params.id

        const eventData = await Event.findById(eventId)

        if (!eventData) {
            return next(new ErrorHandler("Event not found", 500));
        }

        await deleteImagesByUrl(eventData.images)

        const event = await Event.findByIdAndDelete(eventId)

        if (!event) {
            return next(new ErrorHandler("Event not found", 500));
        }

        res.status(201).json({
            success: true,
            message: "event deleted successfully"
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

module.exports = router;

// 3:33:47