const router = require('express').Router();

router.get('/', (_req, res) => res.json({ message: 'API is alive' }));

router.use('/auth', require('./authRoutes'));
router.use('/accounts', require('./accountRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/customers', require('./customerRoutes'));

module.exports = router;
