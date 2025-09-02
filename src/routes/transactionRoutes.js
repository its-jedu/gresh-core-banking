const router = require('express').Router();
const ctrl = require('../controllers/transactionController');
const validate = require('../middlewares/validate');
const { depositSchema, withdrawSchema, transferSchema } = require('../validators/transactionSchemas');

router.post('/deposit', validate(depositSchema), ctrl.deposit);
router.post('/withdraw', validate(withdrawSchema), ctrl.withdraw);
router.post('/transfer', validate(transferSchema), ctrl.transfer);
router.get('/history/:accountNumber', ctrl.history);

module.exports = router;
