const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop.js");
const Product = require("../model/product.js");
const router = express.Router();
const { upload } = require("../multer");
const { isSeller, isAuthenticated } = require("../middleware/auth");
// const fs = require("fs");
// const Order = require("../model/order.js");


// create product 

router.post("/create-product", upload.array("images"), catchAsyncErrors(async (req, res, next) => {
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
            const productData = req.body
            productData.images = imageUrls
            productData.shop = shop

            const product = await Product.create(productData);

            res.status(201).json({
                success: true,
                product,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}));


// get all products (global – used by FeaturedProduct, BestDeals, HomePage)
router.get("/get-all-products", catchAsyncErrors(async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));


router.get("/get-all-products-shop/:shopId", catchAsyncErrors(async (req, res, next) => {
    try {
        // dispatch({
        //     type: "getAllProductsShopRequest"
        // })
        const products = await Product.find({ shopId: req.params.shopId });

        // dispatch({
        //     type:"getAllProductsShopSuccess",
        //     payload:products,
        // })

        res.status(200).json({
            success: true,
            products: products.length > 0 ? products : [],
            message: products.length > 0 ? undefined : "No products found for this shop",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// delete all products of a shop 

router.delete("/delete-shop-product/:id", isSeller, catchAsyncErrors(async (req, res, next) => {
    try {
        const productId = req.params.id

        const productData = await Product.findById(productId)

        if (!productData) {
            return next(new ErrorHandler("Product not found", 500));
        }

        productData.images.forEach((imageUrl) => {
            const filename = imageUrl
            const filePath = `uploads/${filename}`
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        })

        const product = await Product.findByIdAndDelete(productId)
        if (!product) {
            return next(new ErrorHandler("Product not found", 500));
        }

        res.status(201).json({
            success: true,
            message: "product deleted successfully",
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// delete 

module.exports = router;
