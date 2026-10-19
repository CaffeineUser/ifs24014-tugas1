import multer from 'multer';
import HttpError from '../utils/httpError.js';

export function errorHandler(error, req, res, _next) {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Ukuran foto melebihi batas.' : 'Unggahan foto tidak valid.';
    error = new HttpError(400, message);
  }
  if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error = new HttpError(409, 'Data sudah tersedia atau dukungan sudah pernah diberikan.');
  }
  if (error?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error = new HttpError(400, 'Referensi data tidak valid.');
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: { message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada server.' : error.message },
    ...(error.details ? { details: error.details } : {}),
  });
}
