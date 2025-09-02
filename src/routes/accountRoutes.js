const router = require('express').Router();
const ctrl = require('../controllers/accountController');

router.post('/', ctrl.create);                          // POST /api/accounts
router.get('/:accountNumber', ctrl.get);                // GET  /api/accounts/:accountNumber
router.patch('/:accountNumber', ctrl.patch);            // PATCH /api/accounts/:accountNumber

module.exports = router;
