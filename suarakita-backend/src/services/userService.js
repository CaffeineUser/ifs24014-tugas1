import { usersRepository } from '../repositories/usersRepository.js';
import HttpError from '../utils/httpError.js';
export const userService = {
  me(id) { const user = usersRepository.findById(id); if (!user) throw new HttpError(404, 'Pengguna tidak ditemukan.'); return user; },
  updateProfile(id, input) { return usersRepository.updateName(id, input.name); },
  list(page, limit) {
    const total = usersRepository.count();
    return { data: usersRepository.list({ limit, offset: (page - 1) * limit }), pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  },
};
