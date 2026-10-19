import { categoryService } from '../services/categoryService.js';
export const categoryController = {
  list(_req, res) { res.json({ data: categoryService.list() }); },
  create(req, res) { res.status(201).json({ data: categoryService.create(req.body) }); },
  update(req, res) { res.json({ data: categoryService.update(Number(req.params.id), req.body) }); },
  delete(req, res) { res.json(categoryService.delete(Number(req.params.id))); },
};
