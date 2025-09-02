const svc = require('../services/accountService');

exports.create = async (req, res, next) => {
  try {
    const { customer_id, type } = req.body;
    if (!customer_id || !type) return res.status(422).json({ error: 'customer_id and type are required' });
    const acc = await svc.createAccount({ customer_id, type });
    res.status(201).json(acc);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const acc = await svc.getAccount(req.params.accountNumber);
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    res.json(acc);
  } catch (e) { next(e); }
};

exports.patch = async (req, res, next) => {
  try {
    const updated = await svc.updateAccount({ account_number: req.params.accountNumber, ...req.body });
    if (!updated) return res.status(404).json({ error: 'Account not found' });
    res.json(updated);
  } catch (e) { next(e); }
};
