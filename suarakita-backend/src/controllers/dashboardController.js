import { dashboardService } from '../services/dashboardService.js';
export const dashboardController = {
  summary(_req, res) { res.json({ data: dashboardService.summary() }); },
  byCategory(_req, res) { res.json({ data: dashboardService.byCategory() }); },
  byStatus(_req, res) { res.json({ data: dashboardService.byStatus() }); },
  priority(req, res) { res.json({ data: dashboardService.priority(Number((req.validatedQuery || req.query).limit || 10)) }); },
};
