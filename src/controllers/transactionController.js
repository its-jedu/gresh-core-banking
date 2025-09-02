const svc = require('../services/transactionService');

exports.deposit = async (req, res, next) => {
  try {
    const { account_number, amount, reference } = req.body;
    if (!account_number || !amount || !reference) return res.status(422).json({ error: 'account_number, amount, reference required' });
    const result = await svc.deposit({ account_number, amount, reference });
    res.status(result.idempotent ? 200 : 201).json(result.tx);
  } catch (e) { next(e); }
};

exports.withdraw = async (req, res, next) => {
  try {
    const { account_number, amount, reference } = req.body;
    if (!account_number || !amount || !reference) return res.status(422).json({ error: 'account_number, amount, reference required' });
    const result = await svc.withdraw({ account_number, amount, reference });
    res.status(result.idempotent ? 200 : 201).json(result.tx);
  } catch (e) { next(e); }
};

exports.transfer = async (req, res, next) => {
  try {
    const { source_account, destination_account, amount, reference } = req.body;
    if (!source_account || !destination_account || !amount || !reference) {
      return res.status(422).json({ error: 'source_account, destination_account, amount, reference required' });
    }
    const result = await svc.transfer({ source_account, destination_account, amount, reference });
    res.status(result.idempotent ? 200 : 201).json(result.tx);
  } catch (e) { next(e); }
};

exports.history = async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate } = req.query;
    const txs = await svc.history(req.params.accountNumber, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      startDate: startDate || null,
      endDate: endDate || null
    });
    res.json(txs);
  } catch (e) { next(e); }
};
