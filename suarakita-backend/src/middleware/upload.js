import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import HttpError from '../utils/httpError.js';

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const maxBytes = Number(process.env.MAX_FILE_SIZE_MB || 3) * 1024 * 1024;
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' })[file.mimetype];
    cb(null, `${randomUUID()}${ext || ''}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new HttpError(400, 'Foto harus berformat JPEG, PNG, atau WebP.'));
    return cb(null, true);
  },
}).single('photo');

export { uploadDir };
