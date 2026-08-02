const multer = require("multer");

// // For Vercel deployment, we use memory storage instead of disk storage
// const storage = multer.memoryStorage();

// exports.upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB limit
//     },
//     fileFilter: (req, file, cb) => {
//         // Accept only images
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only image files are allowed!'), false);
//         }
//     }
// });



const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const filename = file.originalname.split(".")[0]
        cb(null, filename + "-" + uniqueSuffix + ".png")
    }
});

exports.upload = multer({ storage: storage })