const cloudinary = require('cloudinary').v2;

// The SDK only auto-configures from a CLOUDINARY_URL env var. We store the
// credentials as three separate keys, so we have to hand them over explicitly
// or every signed call fails with "Must supply api_key".
//
// Configured lazily on first use rather than at require-time: this module is
// pulled in by the controllers, and we don't want to depend on dotenv having
// already run by the time the require graph is walked.
let configured = false;

const ensureConfigured = () => {
    if (configured) return;

    const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    const missing = [
        !CLOUDINARY_NAME && "CLOUDINARY_NAME",
        !CLOUDINARY_API_KEY && "CLOUDINARY_API_KEY",
        !CLOUDINARY_API_SECRET && "CLOUDINARY_API_SECRET",
    ].filter(Boolean);

    if (missing.length) {
        throw new Error(
            `Cloudinary is not configured — missing ${missing.join(", ")} in backend/config/.env`
        );
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });

    configured = true;
};

// Upload image to Cloudinary
const uploadToCloudinary = async (fileBuffer, filename, folder = 'uploads') => {
    ensureConfigured();

    if (!Buffer.isBuffer(fileBuffer)) {
        // Almost always means multer is on diskStorage, so req.file.buffer is
        // undefined. upload_stream would otherwise fail with a confusing error.
        throw new Error(
            "uploadToCloudinary expected a file buffer — check that multer is using memoryStorage"
        );
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: folder,
                public_id: filename,
                overwrite: true,
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

// Turn a stored secure_url back into the public_id needed to delete it.
// Returns null for anything that isn't a Cloudinary URL — legacy avatars and
// product images are bare local filenames from the old disk-storage days.
const publicIdFromUrl = (url) => {
    if (typeof url !== "string" || !url.includes("res.cloudinary.com")) {
        return null;
    }

    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;

    return afterUpload
        .split("/")
        .filter((segment) => !/^v\d+$/.test(segment)) // drop the version segment
        .join("/")
        .replace(/\.[^/.]+$/, "");                    // drop the file extension
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    ensureConfigured();

    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

// Best-effort cleanup for a list of stored image URLs. Never throws — losing an
// orphaned image is not a reason to fail the delete request the user asked for.
const deleteImagesByUrl = async (urls = []) => {
    await Promise.all(
        urls.map(async (url) => {
            const publicId = publicIdFromUrl(url);
            if (!publicId) return;

            try {
                await deleteFromCloudinary(publicId);
            } catch (error) {
                console.error(`Failed to delete ${publicId} from Cloudinary:`, error.message);
            }
        })
    );
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    deleteImagesByUrl,
    publicIdFromUrl
};
