import bcrypt from 'bcryptjs';
import db from '../src/config/db.js';
import { calculatePriorityScore } from '../src/utils/priority.js';

const insertUser = db.prepare('INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
const userHash = bcrypt.hashSync('WargaDemo123!', 10);
const adminHash = bcrypt.hashSync('AdminDemo123!', 10);
insertUser.run('Warga Demo', 'warga@example.com', userHash, 'warga');
insertUser.run('Admin Demo', 'admin@example.com', adminHash, 'admin');
const warga = db.prepare('SELECT id FROM users WHERE email = ?').get('warga@example.com');
const insertReport = db.prepare(`INSERT INTO reports (user_id, category_id, title, description, location_name, latitude, longitude, urgency, status, photo_path, priority_score)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const count = db.prepare('SELECT COUNT(*) AS count FROM reports').get().count;
if (count === 0) {
  const examples = [
    [1, 'Lubang besar di jalan lingkungan', 'Terdapat lubang besar yang berisiko bagi pengendara sepeda motor.', 'Jalan Melati, dekat balai warga', -2.333, 99.066, 'tinggi', 'diajukan', 'sample-road.jpg', 0],
    [2, 'Sampah menumpuk di tempat penampungan', 'Sampah sudah menumpuk beberapa hari dan menimbulkan bau.', 'Area penampungan RT 03', -2.334, 99.067, 'sedang', 'diverifikasi', 'sample-trash.jpg', 0],
    [3, 'Saluran drainase tersumbat', 'Air tidak mengalir dengan baik setelah hujan.', 'Gang Kenanga', -2.335, 99.068, 'kritis', 'diproses', 'sample-drain.jpg', 0],
  ];
  const insertSupport = db.prepare('INSERT OR IGNORE INTO report_supports (report_id, user_id) VALUES (?, ?)');
  const insertHistory = db.prepare('INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)');
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
  const tx = db.transaction(() => {
    for (const item of examples) {
      const [categoryId, title, description, locationName, lat, lon, urgency, status, photo] = item;
      const result = insertReport.run(warga.id, categoryId, title, description, locationName, lat, lon, urgency, status, photo, calculatePriorityScore(urgency, 0));
      if (status === 'diajukan') {
        insertHistory.run(result.lastInsertRowid, warga.id, null, 'diajukan', 'Data contoh seed.');
      } else if (status === 'diverifikasi') {
        insertHistory.run(result.lastInsertRowid, admin.id, 'diajukan', 'diverifikasi', 'Data contoh seed.');
      } else if (status === 'diproses') {
        insertHistory.run(result.lastInsertRowid, admin.id, 'diajukan', 'diverifikasi', 'Data contoh seed.');
        insertHistory.run(result.lastInsertRowid, admin.id, 'diverifikasi', 'diproses', 'Data contoh seed.');
      }
    }
  });
  tx();
}
console.log('Data contoh tersedia. Akun demo: warga@example.com / WargaDemo123! dan admin@example.com / AdminDemo123!');
db.close();
