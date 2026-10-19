import db from '../config/db.js';

export const usersRepository = {
  findByEmail(email) { return db.prepare('SELECT * FROM users WHERE email = ?').get(email); },
  findById(id) { return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id); },
  create({ name, email, passwordHash }) {
    const result = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name, email, passwordHash, 'warga');
    return this.findById(result.lastInsertRowid);
  },
  updateName(id, name) { db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, id); return this.findById(id); },
  list({ limit, offset }) { return db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset); },
  count() { return db.prepare('SELECT COUNT(*) AS total FROM users').get().total; },
};
