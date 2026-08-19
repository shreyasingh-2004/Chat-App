import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// ✅ Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Single endpoint — accepts base64 dataUrl (matches what MessageInput.js sends)
router.post('/upload-media', protectRoute, async (req, res) => {
  try {
    console.log('📸 Upload request received');

    const { dataUrl, fileName, mimeType, size, mediaType } = req.body;

    if (!dataUrl) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // 5 MB limit
    if (size && size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max size is 5MB' });
    }

    // Validate it's a proper data URL
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid file data' });
    }

    // Determine Cloudinary resource type
    const isImage = mediaType === 'image' || mimeType?.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      resource_type: resourceType,
      folder: 'chat_attachments',
      // Use original filename (sanitized) as public_id
      public_id: `${Date.now()}_${(fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      overwrite: false,
    });

    console.log('✅ Cloudinary upload success:', uploadResult.secure_url);

    // ✅ Return shape that matches what socket.js and message.model.js expect
    return res.json({
      success:  true,
      url:      uploadResult.secure_url,
      fileName: fileName || 'file',
      size:     uploadResult.bytes || size,
      mimeType: mimeType || '',
      type:     isImage ? 'image' : 'file',   // ✅ matches attachment.type in model
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

export default router;