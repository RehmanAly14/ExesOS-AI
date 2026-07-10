const multer = require("multer");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../../uploads");
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        const err = new Error("Only PDF, DOCX, and TXT files are allowed");
        err.statusCode = 400;
        return cb(err);
    }

    cb(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});
