const svc = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const user = await svc.register(req.body);
    res.status(201).json(user);
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await svc.login(req.body);
    res.json(result);
  } catch (e) { next(e); }
};
