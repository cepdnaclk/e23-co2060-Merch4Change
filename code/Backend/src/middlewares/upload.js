import multer from "multer";
import AppError from "../utils/appError.js";

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Only JPEG, PNG, WEBP, and GIF images are allowed",
          400,
          "INVALID_FILE_TYPE",
        ),
        false,
      );
    }
  },
});

// changes: stores uploaded files in memory as buffers — not on disk
