import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// WhatsApp-style cap: 64MB for media, 100MB for docs (Cloudinary free tier tops out around 100MB anyway)
const MAX_FILE_SIZE = 64 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

// Streams a buffer straight into Cloudinary without ever writing to disk
const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

router.post(
  "/upload-media",
  protectRoute,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: `File too large. Max size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
          });
        }
        return res.status(400).json({ error: err.message });
      }
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const { originalname, mimetype, size, buffer } = req.file;
      const mediaTypeHint = req.body.mediaType;

      const isImage = mediaTypeHint === "image" || mimetype?.startsWith("image/");
      const isVideo = mediaTypeHint === "video" || mimetype?.startsWith("video/");
      const isVoice = mediaTypeHint === "voice" || mimetype?.startsWith("audio/");

      // Cloudinary requires resource_type "video" for both video and audio
      const resourceType = isImage ? "image" : isVideo || isVoice ? "video" : "raw";

      const publicId = `${Date.now()}_${(originalname || "file").replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const uploadOptions = {
        resource_type: resourceType,
        folder: "chat_attachments",
        public_id: publicId,
        overwrite: false,
      };

      // Ask Cloudinary to also generate a poster-frame thumbnail for videos,
      // the same way WhatsApp shows a still frame before you tap play.
      if (isVideo) {
        uploadOptions.eager = [
          { format: "jpg", transformation: [{ width: 400, crop: "scale" }] },
        ];
      }

      const result = await streamUpload(buffer, uploadOptions);

      const thumbnailUrl =
        isVideo && result.eager?.[0]?.secure_url ? result.eager[0].secure_url : undefined;

      return res.json({
        success: true,
        url: result.secure_url,
        thumbnailUrl,
        fileName: originalname || "file",
        size: result.bytes || size,
        mimeType: mimetype || "",
        duration: result.duration,
        type: isImage ? "image" : isVideo ? "video" : isVoice ? "voice" : "file",
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Upload failed: " + error.message });
    }
  }
);

export default router;