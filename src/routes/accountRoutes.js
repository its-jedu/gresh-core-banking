const router = require('express').Router();
const ctrl = require('../controllers/accountController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { createAccountSchema } = require('../validators/accountSchemas');

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [savings, current]
 *     responses:
 *       201:
 *         description: Account created
 */
router.post('/', auth(), validate(createAccountSchema), ctrl.create);

/**
 * @swagger
 * /api/accounts/{accountNumber}:
 *   get:
 *     summary: Get account details
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Account details
 */
router.get('/:accountNumber', auth(), ctrl.get);

/**
 * @swagger
 * /api/accounts/{accountNumber}:
 *   patch:
 *     summary: Update account (type/status)
 *     tags: [Accounts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [savings, current]
 *                 example: current
 *               status:
 *                 type: string
 *                 enum: [active, closed]
 *                 example: active
 *     responses:
 *       200: { description: Account updated }
 */
router.patch('/:accountNumber', auth(), ctrl.patch);

/**
 * @swagger
 * /api/accounts/{accountNumber}:
 *   delete:
 *     summary: Close an account
 *     tags: [Accounts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Account closed }
 *       404: { description: Account not found }
 */
router.delete('/:accountNumber', auth(), ctrl.close);

module.exports = router;
