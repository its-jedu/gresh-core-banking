const router = require('express').Router();
const ctrl = require('../controllers/transactionController');

router.post('/deposit', ctrl.deposit);                  // POST /api/transactions/deposit
router.post('/withdraw', ctrl.withdraw);                // POST /api/transactions/withdraw
router.post('/transfer', ctrl.transfer);                // POST /api/transactions/transfer
router.get('/history/:accountNumber', ctrl.history);     // GET /api/transactions/history/:accountNumber

module.exports = router;
