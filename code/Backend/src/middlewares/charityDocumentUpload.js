import multer from "multer";

const ALLOWED_DOCUMENT_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const charityDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_DOCUMENT_MIMES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, WEBP, and PDF files are allowed."));
  },
});
