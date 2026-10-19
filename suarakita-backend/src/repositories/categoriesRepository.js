import db from '../config/db.js';

export const categoriesRepository = {
  list() { return db.prepare('SELECT id, name, description, created_at FROM categories ORDER BY name').all(); },
  findById(id) { return db.prepare('SELECT id, name, description, created_at FROM categories WHERE id = ?').get(id); },
  create({ name, description }) {
    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description ?? null);
    return this.findById(result.lastInsertRowid);
  },
  update(id, { name, description }) {
    db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description ?? null, id);
    return this.findById(id);
  },
  delete(id) { return db.prepare('DELETE FROM categories WHERE id = ?').run(id).changes > 0; },
};
