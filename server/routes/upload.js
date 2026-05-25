import express from "express";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const result = await uploadToCloudinary(req.file.buffer, { folder: 'uploads' });

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
// Multer error handler
router.use((error, req, res, next) => {

  // File too large
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File is too large. Maximum size is 5MB."
    });
  }

  // Other multer/file errors
  return res.status(400).json({
    success: false,
    message: error.message || "File upload error"
  });
});

export default router;
