const router = require('express').Router();
const ctrl = require('../controllers/transactionController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { depositSchema, withdrawSchema, transferSchema } = require('../validators/transactionSchemas');

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Deposit into an account
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [account_number, amount, reference]
 *             properties:
 *               account_number: { type: string, example: "1234567890" }
 *               amount: { type: number, example: 5000 }
 *               reference: { type: string, example: "ref-101" }
 *     responses:
 *       201: { description: Deposit recorded }
 */
router.post('/deposit', auth(), validate(depositSchema), ctrl.deposit);

/**
 * @swagger
 * /api/transactions/withdraw:
 *   post:
 *     summary: Withdraw from an account
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [account_number, amount, reference]
 *             properties:
 *               account_number: { type: string, example: "1234567890" }
 *               amount: { type: number, example: 1000 }
 *               reference: { type: string, example: "ref-102" }
 *     responses:
 *       201: { description: Withdrawal recorded }
 */
router.post('/withdraw', auth(), validate(withdrawSchema), ctrl.withdraw);

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transfer funds between accounts
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [source_account, destination_account, amount, reference]
 *             properties:
 *               source_account: { type: string, example: "1234567890" }
 *               destination_account: { type: string, example: "9876543210" }
 *               amount: { type: number, example: 300 }
 *               reference: { type: string, example: "ref-103" }
 *     responses:
 *       201: { description: Transfer recorded }
 */
router.post('/transfer', auth(), validate(transferSchema), ctrl.transfer);

/**
 * @swagger
 * /api/transactions/history/{accountNumber}:
 *   get:
 *     summary: Get transaction history
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2025-09-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2025-09-30" }
 *     responses:
 *       200: { description: List of transactions }
 */
router.get('/history/:accountNumber', auth(), ctrl.history);

module.exports = router;