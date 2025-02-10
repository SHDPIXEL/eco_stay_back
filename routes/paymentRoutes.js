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
router.get('/payment/user/:user_id', getPaymentsByUserId);
router.get('/payment/agent/:agentId', getPaymentsByAgentId);

module.exports = router;
