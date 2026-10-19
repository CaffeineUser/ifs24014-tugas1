import db from '../config/db.js';

const selectReport = `
  SELECT r.*, u.name AS reporter_name, c.name AS category_name,
    (SELECT COUNT(*) FROM report_supports rs WHERE rs.report_id = r.id) AS support_count
  FROM reports r
  JOIN users u ON u.id = r.user_id
  JOIN categories c ON c.id = r.category_id
`;

export const reportsRepository = {
  findById(id) { return db.prepare(`${selectReport} WHERE r.id = ?`).get(id); },
  list({ whereSql, params, sortSql, orderSql, limit, offset }) {
    const rows = db.prepare(`${selectReport} ${whereSql} ORDER BY ${sortSql} ${orderSql}, r.id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    const count = db.prepare(`SELECT COUNT(*) AS total FROM reports r JOIN categories c ON c.id = r.category_id ${whereSql}`).get(...params).total;
    return { rows, total: count };
  },
  create({ userId, categoryId, title, description, locationName, latitude, longitude, urgency, photoPath, priorityScore }) {
    const insert = db.prepare(`INSERT INTO reports
      (user_id, category_id, title, description, location_name, latitude, longitude, urgency, status, photo_path, priority_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'diajukan', ?, ?)`);
    const result = insert.run(userId, categoryId, title, description, locationName, latitude ?? null, longitude ?? null, urgency, photoPath, priorityScore);
    return this.findById(result.lastInsertRowid);
  },
  updateEditable(id, data) {
    const fields = Object.keys(data);
    const columnMap = { category_id: 'category_id', title: 'title', description: 'description', location_name: 'location_name', latitude: 'latitude', longitude: 'longitude', urgency: 'urgency' };
    const assignments = fields.map((field) => `${columnMap[field]} = ?`);
    const values = fields.map((field) => data[field]);
    assignments.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
    db.prepare(`UPDATE reports SET ${assignments.join(', ')} WHERE id = ?`).run(...values, id);
    return this.findById(id);
  },
  updateStatus(id, status) {
    db.prepare("UPDATE reports SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").run(status, id);
    return this.findById(id);
  },
  updateUrgencyAndScore(id, urgency, score) {
    db.prepare("UPDATE reports SET urgency = ?, priority_score = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").run(urgency, score, id);
    return this.findById(id);
  },
  updatePhoto(id, photoPath) {
    db.prepare("UPDATE reports SET photo_path = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").run(photoPath, id);
    return this.findById(id);
  },
  delete(id) { return db.prepare('DELETE FROM reports WHERE id = ?').run(id).changes > 0; },
  countByStatus() { return db.prepare('SELECT status, COUNT(*) AS count FROM reports GROUP BY status').all(); },
  countByCategory() { return db.prepare('SELECT c.id, c.name, COUNT(r.id) AS count FROM categories c LEFT JOIN reports r ON r.category_id = c.id GROUP BY c.id ORDER BY count DESC, c.name').all(); },
  summary() {
    const total = db.prepare('SELECT COUNT(*) AS count FROM reports').get().count;
    const byStatus = Object.fromEntries(this.countByStatus().map((row) => [row.status, row.count]));
    return { total_reports: total, submitted_reports: byStatus.diajukan || 0, verified_reports: byStatus.diverifikasi || 0, in_progress_reports: byStatus.diproses || 0, completed_reports: byStatus.selesai || 0, rejected_reports: byStatus.ditolak || 0 };
  },
  priorityList(limit = 10) { return db.prepare(`${selectReport} ORDER BY r.priority_score DESC, r.created_at ASC LIMIT ?`).all(limit); },
  history(id) {
    return db.prepare(`SELECT h.*, u.name AS changed_by_name FROM report_status_history h JOIN users u ON u.id = h.changed_by WHERE h.report_id = ? ORDER BY h.changed_at DESC, h.id DESC`).all(id);
  },
  addHistory({ reportId, changedBy, oldStatus, newStatus, note }) {
    return db.prepare('INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)').run(reportId, changedBy, oldStatus ?? null, newStatus, note ?? null);
  },
  addSupport(reportId, userId) { return db.prepare('INSERT INTO report_supports (report_id, user_id) VALUES (?, ?)').run(reportId, userId); },
  removeSupport(reportId, userId) { return db.prepare('DELETE FROM report_supports WHERE report_id = ? AND user_id = ?').run(reportId, userId).changes > 0; },
  findSupport(reportId, userId) { return db.prepare('SELECT id FROM report_supports WHERE report_id = ? AND user_id = ?').get(reportId, userId); },
  supportCount(reportId) { return db.prepare('SELECT COUNT(*) AS count FROM report_supports WHERE report_id = ?').get(reportId).count; },
  listSupports(reportId, { limit, offset }) {
    const rows = db.prepare('SELECT u.id AS user_id, u.name, rs.created_at FROM report_supports rs JOIN users u ON u.id = rs.user_id WHERE rs.report_id = ? ORDER BY rs.created_at DESC LIMIT ? OFFSET ?').all(reportId, limit, offset);
    const total = this.supportCount(reportId);
    return { rows, total };
  },
  refreshPriorityScore(reportId, score) { db.prepare('UPDATE reports SET priority_score = ? WHERE id = ?').run(score, reportId); },
};
