import { supportService } from '../services/supportService.js';
export const supportController = {
  add(req, res) { res.status(201).json({ data: supportService.add(Number(req.params.id), req.user.id) }); },
  remove(req, res) { res.json({ data: supportService.remove(Number(req.params.id), req.user.id) }); },
  list(req, res) { res.json(supportService.list(Number(req.params.id), (req.validatedQuery || req.query).page, (req.validatedQuery || req.query).limit)); },
};
