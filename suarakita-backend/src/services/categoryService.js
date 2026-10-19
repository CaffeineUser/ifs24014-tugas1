import { categoriesRepository } from '../repositories/categoriesRepository.js';
import HttpError from '../utils/httpError.js';

export const categoryService = {
  list() { return categoriesRepository.list(); },
  create(input) {
    try { return categoriesRepository.create(input); }
    catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new HttpError(409, 'Nama kategori sudah digunakan.'); throw error; }
  },
  update(id, input) {
    if (!categoriesRepository.findById(id)) throw new HttpError(404, 'Kategori tidak ditemukan.');
    try { return categoriesRepository.update(id, input); }
    catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new HttpError(409, 'Nama kategori sudah digunakan.'); throw error; }
  },
  delete(id) {
    if (!categoriesRepository.findById(id)) throw new HttpError(404, 'Kategori tidak ditemukan.');
    try { categoriesRepository.delete(id); return { message: 'Kategori dihapus.' }; }
    catch (error) { if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') throw new HttpError(409, 'Kategori sudah digunakan oleh laporan dan tidak dapat dihapus.'); throw error; }
  },
};
