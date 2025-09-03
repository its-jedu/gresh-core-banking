const router = require('express').Router();
const ctrl = require('../controllers/customerController');
const auth = require('../middlewares/auth');

router.post('/', auth(), ctrl.create);
router.get('/', auth(), ctrl.list);

module.exports = router;
