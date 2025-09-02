const router = require('express').Router();
const ctrl = require('../controllers/accountController');
const validate = require('../middlewares/validate');
const { createAccountSchema } = require('../validators/accountSchemas');

router.post('/', validate(createAccountSchema), ctrl.create);
router.get('/:accountNumber', ctrl.get);
router.patch('/:accountNumber', ctrl.patch);
router.delete('/:accountNumber', ctrl.close);

module.exports = router;
