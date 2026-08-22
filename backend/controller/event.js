const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop.js");
const Event = require("../model/event.js");
const router = express.Router();
const { upload } = require("../multer");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const fs = require("fs")

// create product 

router.post("/create-event", isSeller, upload.array("images"), catchAsyncErrors(async (req, res, next) => {
    try {
        const shopId = req.body.shopId;
        const shop = await Shop.findById(shopId);

        if (!shop) {
            return next(new ErrorHandler("Shop not found", 404));
        } else {
            const files = req.files;

            // if (!files || files.length === 0) {
            //     return next(new ErrorHandler("Please upload at least one image", 400));
            // }

            const imageUrls = files.map((file) => `${file.filename}`)
            console.log(imageUrls)
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

//get all product 

router.get("/get-all-events/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        // dispatch({
        //     type: "getAllProductsShopRequest"
        // })
        const events = await Event.find({ shopId: req.params.id });

        // dispatch({
        //     type:"getAllProductsShopSuccess",
        //     payload:products,
        // })

        res.status(200).json({
            success: true,
            events: events.length > 0 ? events : [],
            message: events.length > 0 ? undefined : "No events found for this shop",
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

        eventData.images.forEach((imageUrl) => {
            const filename = imageUrl
            const filePath = `uploads/${filename}`
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        })

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