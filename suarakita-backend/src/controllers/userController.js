import { userService } from '../services/userService.js';
export const userController = {
  me(req, res) { res.json({ data: userService.me(req.user.id) }); },
  updateProfile(req, res) { res.json({ data: userService.updateProfile(req.user.id, req.body) }); },
  list(req, res) { res.json(userService.list((req.validatedQuery || req.query).page, (req.validatedQuery || req.query).limit)); },
};
