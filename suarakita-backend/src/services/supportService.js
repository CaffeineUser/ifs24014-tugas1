import db from '../config/db.js';
import { reportsRepository } from '../repositories/reportsRepository.js';
import { calculatePriorityScore } from '../utils/priority.js';
import HttpError from '../utils/httpError.js';

export const supportService = {
  add(reportId, userId) {
    const report = reportsRepository.findById(reportId);
    if (!report) throw new HttpError(404, 'Laporan tidak ditemukan.');
    if (report.user_id === userId) throw new HttpError(400, 'Anda tidak dapat mendukung laporan sendiri.');
    if (reportsRepository.findSupport(reportId, userId)) throw new HttpError(409, 'Anda sudah mendukung laporan ini.');
    const result = db.transaction(() => {
      reportsRepository.addSupport(reportId, userId);
      const count = reportsRepository.supportCount(reportId);
      reportsRepository.refreshPriorityScore(reportId, calculatePriorityScore(report.urgency, count));
      return { report_id: reportId, support_count: count, priority_score: calculatePriorityScore(report.urgency, count) };
    })();
    return result;
  },
  remove(reportId, userId) {
    const report = reportsRepository.findById(reportId);
    if (!report) throw new HttpError(404, 'Laporan tidak ditemukan.');
    const result = db.transaction(() => {
      const removed = reportsRepository.removeSupport(reportId, userId);
      if (!removed) throw new HttpError(404, 'Dukungan Anda pada laporan ini tidak ditemukan.');
      const count = reportsRepository.supportCount(reportId);
      const score = calculatePriorityScore(report.urgency, count);
      reportsRepository.refreshPriorityScore(reportId, score);
      return { report_id: reportId, support_count: count, priority_score: score };
    })();
    return result;
  },
  list(reportId, page, limit) {
    if (!reportsRepository.findById(reportId)) throw new HttpError(404, 'Laporan tidak ditemukan.');
    const result = reportsRepository.listSupports(reportId, { limit, offset: (page - 1) * limit });
    return { data: result.rows, pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) } };
  },
};
