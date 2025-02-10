const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByAgentId

} = require('../controllers/paymentController');

router.post('/payment', createPayment);
router.get('/payment', getAllPayments);
router.get('/payment/:id', getPaymentById);
router.get('/payment/user/:userId', getPaymentsByUserId);
router.get('/payment/agent/:agentId', getPaymentsByAgentId);

module.exports = router;
