import fs from 'node:fs';
import path from 'node:path';
import db from '../config/db.js';
import { categoriesRepository } from '../repositories/categoriesRepository.js';
import { reportsRepository } from '../repositories/reportsRepository.js';
import { calculatePriorityScore } from '../utils/priority.js';
import HttpError from '../utils/httpError.js';
import { uploadDir } from '../middleware/upload.js';

const allowedTransitions = {
  diajukan: ['diverifikasi', 'ditolak'],
  diverifikasi: ['diproses', 'ditolak'],
  diproses: ['selesai', 'ditolak'],
  selesai: [],
  ditolak: [],
};
const withPriority = (report) => report ? { ...report, priority_score: calculatePriorityScore(report.urgency, report.support_count) } : report;

export const reportService = {
  list(query) {
    const conditions = [];
    const params = [];
    if (query.q) {
      conditions.push('(r.title LIKE ? ESCAPE char(92) OR r.description LIKE ? ESCAPE char(92) OR r.location_name LIKE ? ESCAPE char(92))');
      const escaped = query.q.replace(/[\\%_]/g, '\\$&');
      const pattern = `%${escaped}%`;
      params.push(pattern, pattern, pattern);
    }
    if (query.category_id) { conditions.push('r.category_id = ?'); params.push(query.category_id); }
    if (query.status) { conditions.push('r.status = ?'); params.push(query.status); }
    if (query.urgency) { conditions.push('r.urgency = ?'); params.push(query.urgency); }
    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumns = { priority: 'r.priority_score', created_at: 'r.created_at', updated_at: 'r.updated_at', support_count: 'support_count' };
    const result = reportsRepository.list({ whereSql, params, sortSql: sortColumns[query.sort], orderSql: query.order.toUpperCase(), limit: query.limit, offset: (query.page - 1) * query.limit });
    const data = result.rows.map(withPriority);
    return { data, pagination: { page: query.page, limit: query.limit, total: result.total, total_pages: Math.ceil(result.total / query.limit) } };
  },
  getById(id) {
    const report = reportsRepository.findById(id);
    if (!report) throw new HttpError(404, 'Laporan tidak ditemukan.');
    return withPriority(report);
  },
  create(userId, input, photo) {
    if (!photo) throw new HttpError(400, 'Foto laporan wajib disertakan pada field "photo".');
    if (!categoriesRepository.findById(input.category_id)) {
      fs.unlink(photo.path, () => {});
      throw new HttpError(400, 'Kategori tidak ditemukan.');
    }
    const score = calculatePriorityScore(input.urgency, 0);
    try {
      const report = db.transaction(() => {
        const created = reportsRepository.create({
          userId, categoryId: input.category_id, title: input.title, description: input.description,
          locationName: input.location_name, latitude: input.latitude, longitude: input.longitude,
          urgency: input.urgency, photoPath: path.basename(photo.path), priorityScore: score,
        });
        reportsRepository.addHistory({ reportId: created.id, changedBy: userId, oldStatus: null, newStatus: 'diajukan', note: 'Laporan dibuat.' });
        return created;
      })();
      return withPriority(report);
    } catch (error) {
      fs.unlink(photo.path, () => {});
      throw error;
    }
  },
  updateOwn(userId, id, input) {
    const current = reportsRepository.findById(id);
    if (!current) throw new HttpError(404, 'Laporan tidak ditemukan.');
    if (current.user_id !== userId) throw new HttpError(403, 'Anda hanya dapat mengubah laporan sendiri.');
    if (current.status !== 'diajukan') throw new HttpError(409, 'Laporan hanya dapat diubah saat status masih diajukan.');
    if (input.category_id && !categoriesRepository.findById(input.category_id)) throw new HttpError(400, 'Kategori tidak ditemukan.');
    const updated = db.transaction(() => {
      const result = reportsRepository.updateEditable(id, input);
      if (input.urgency) {
        const score = calculatePriorityScore(result.urgency, result.support_count);
        reportsRepository.refreshPriorityScore(id, score);
      }
      return reportsRepository.findById(id);
    })();
    return withPriority(updated);
  },
  updateStatus(adminId, id, { status, note }) {
    const current = reportsRepository.findById(id);
    if (!current) throw new HttpError(404, 'Laporan tidak ditemukan.');
    if (current.status === status) throw new HttpError(409, 'Status laporan sudah sama.');
    if (!allowedTransitions[current.status]?.includes(status)) throw new HttpError(409, `Perubahan status dari ${current.status} ke ${status} tidak diizinkan.`);
    const result = db.transaction(() => {
      reportsRepository.updateStatus(id, status);
      reportsRepository.addHistory({ reportId: id, changedBy: adminId, oldStatus: current.status, newStatus: status, note });
      return reportsRepository.findById(id);
    })();
    return withPriority(result);
  },
  updateUrgency(id, urgency) {
    const current = reportsRepository.findById(id);
    if (!current) throw new HttpError(404, 'Laporan tidak ditemukan.');
    const score = calculatePriorityScore(urgency, current.support_count);
    return withPriority(reportsRepository.updateUrgencyAndScore(id, urgency, score));
  },
  updatePhoto(userId, id, photo) {
    if (!photo) throw new HttpError(400, 'Foto wajib diunggah pada field "photo".');
    const current = reportsRepository.findById(id);
    if (!current) { fs.unlink(photo.path, () => {}); throw new HttpError(404, 'Laporan tidak ditemukan.'); }
    if (current.user_id !== userId || current.status !== 'diajukan') {
      fs.unlink(photo.path, () => {});
      throw new HttpError(403, 'Foto hanya dapat diganti oleh pemilik laporan yang masih berstatus diajukan.');
    }
    const oldPath = current.photo_path;
    const updated = reportsRepository.updatePhoto(id, path.basename(photo.path));
    if (oldPath) fs.unlink(path.join(uploadDir, path.basename(oldPath)), () => {});
    return withPriority(updated);
  },
  deleteOwn(userId, id) {
    const current = reportsRepository.findById(id);
    if (!current) throw new HttpError(404, 'Laporan tidak ditemukan.');
    if (current.user_id !== userId) throw new HttpError(403, 'Anda hanya dapat menghapus laporan sendiri.');
    if (current.status !== 'diajukan') throw new HttpError(409, 'Laporan hanya dapat dihapus saat status masih diajukan.');
    db.transaction(() => reportsRepository.delete(id))();
    if (current.photo_path) fs.unlink(path.join(uploadDir, path.basename(current.photo_path)), () => {});
    return { message: 'Laporan berhasil dihapus.' };
  },
  history(id) {
    if (!reportsRepository.findById(id)) throw new HttpError(404, 'Laporan tidak ditemukan.');
    return reportsRepository.history(id);
  },
  photoPath(id) {
    const report = reportsRepository.findById(id);
    if (!report) throw new HttpError(404, 'Laporan tidak ditemukan.');
    const fullPath = path.resolve(uploadDir, path.basename(report.photo_path));
    if (!fs.existsSync(fullPath)) throw new HttpError(404, 'File foto tidak ditemukan.');
    return fullPath;
  },
};
