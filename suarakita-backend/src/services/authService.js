import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersRepository } from '../repositories/usersRepository.js';
import HttpError from '../utils/httpError.js';

export const authService = {
  register(input) {
    if (usersRepository.findByEmail(input.email)) throw new HttpError(409, 'Email sudah terdaftar.');
    const passwordHash = bcrypt.hashSync(input.password, 12);
    const user = usersRepository.create({ name: input.name, email: input.email, passwordHash });
    return { user, token: this.createToken(user) };
  },
  login(input) {
    const userRecord = usersRepository.findByEmail(input.email);
    if (!userRecord || !bcrypt.compareSync(input.password, userRecord.password_hash)) throw new HttpError(401, 'Email atau kata sandi salah.');
    const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email, role: userRecord.role, created_at: userRecord.created_at };
    return { user, token: this.createToken(user) };
  },
  createToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) throw new HttpError(500, 'Konfigurasi JWT_SECRET belum aman. Isi .env dengan secret acak minimal 32 karakter.');
    return jwt.sign({ name: user.name, role: user.role }, secret, { subject: String(user.id), expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  },
};
