import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the uploads directory relative to server root
export const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Also ensure relative 'uploads' exists in working directory if different
const cwdUploads = path.resolve('uploads');
if (!fs.existsSync(cwdUploads)) {
  try {
    fs.mkdirSync(cwdUploads, { recursive: true });
  } catch (_err) {
    // Ignore if already created
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalExt = path.extname(file.originalname) || '';
    const safeBase = path.basename(file.originalname, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${file.fieldname}-${uniqueSuffix}-${safeBase}${originalExt}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

export default upload;
