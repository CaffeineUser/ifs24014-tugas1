import jwt from 'jsonwebtoken';
import HttpError from '../utils/httpError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Token autentikasi diperlukan.'));
  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) throw new Error('JWT_SECRET belum dikonfigurasi dengan aman.');
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, role: payload.role, name: payload.name };
    return next();
  } catch {
    return next(new HttpError(401, 'Token tidak valid atau sudah kedaluwarsa.'));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Silakan login terlebih dahulu.'));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, 'Anda tidak memiliki hak akses untuk tindakan ini.'));
    return next();
  };
}
