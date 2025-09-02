const router = require('express').Router();

router.get('/', (_req, res) => res.json({ message: 'API is alive' }));

router.use('/accounts', require('./accountRoutes'));
router.use('/transactions', require('./transactionRoutes'));

module.exports = router;
