import { authService } from '../services/authService.js';
import { usersRepository } from '../repositories/usersRepository.js';
import HttpError from '../utils/httpError.js';

export const authController = {
  register(req, res) { const result = authService.register(req.body); res.status(201).json({ data: result }); },
  login(req, res) { res.json({ data: authService.login(req.body) }); },
  logout(_req, res) { res.json({ message: 'Logout berhasil. Hapus token dari sisi klien.' }); },
  me(req, res) {
    const user = usersRepository.findById(req.user.id);
    if (!user) throw new HttpError(404, 'Pengguna tidak ditemukan.');
    res.json({ data: user });
  },
};
