import { reportService } from '../services/reportService.js';
export const reportController = {
  list(req, res) { res.json(reportService.list(req.validatedQuery || req.query)); },
  getById(req, res) { res.json({ data: reportService.getById(Number(req.params.id)) }); },
  create(req, res) { res.status(201).json({ data: reportService.create(req.user.id, req.body, req.file) }); },
  updateOwn(req, res) { res.json({ data: reportService.updateOwn(req.user.id, Number(req.params.id), req.body) }); },
  updateStatus(req, res) { res.json({ data: reportService.updateStatus(req.user.id, Number(req.params.id), req.body) }); },
  updateUrgency(req, res) { res.json({ data: reportService.updateUrgency(Number(req.params.id), req.body.urgency) }); },
  updatePhoto(req, res) { res.json({ data: reportService.updatePhoto(req.user.id, Number(req.params.id), req.file) }); },
  deleteOwn(req, res) { res.json(reportService.deleteOwn(req.user.id, Number(req.params.id))); },
  history(req, res) { res.json({ data: reportService.history(Number(req.params.id)) }); },
  photo(req, res) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(reportService.photoPath(Number(req.params.id)));
  },
};
