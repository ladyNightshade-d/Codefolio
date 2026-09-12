import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = Router();

const BUCKET = 'project-assets';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']);

// Use memory storage so we can pipe to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter(_req, file, cb) {
    if (ALLOWED_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use PNG, JPG, GIF, or WebP.'));
    }
  },
});

/**
 * POST /api/upload
 * Uploads one or more image files to Supabase Storage.
 * Returns: { urls: string[] }
 */
router.post('/', requireAuth, upload.array('images', 8), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  try {
    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const filename = `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        return publicUrl.publicUrl;
      })
    );

    res.json({ urls: uploadResults });
  } catch (err) {
    console.error('[upload/POST /]', err);
    res.status(500).json({ error: 'File upload failed. Please try again.' });
  }
});

export default router;
