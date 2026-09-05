const multer = require("multer");

// Images go straight to Cloudinary, so multer only needs to hold the file in
// memory long enough to hand the buffer over — nothing is written to disk.
const storage = multer.memoryStorage();

exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});
