import { reportsRepository } from '../repositories/reportsRepository.js';
export const dashboardService = {
  summary() { return reportsRepository.summary(); },
  byCategory() { return reportsRepository.countByCategory(); },
  byStatus() { return reportsRepository.countByStatus(); },
  priority(limit) { return reportsRepository.priorityList(limit).map((report) => ({ ...report, priority_score: Number(report.priority_score) })); },
};
