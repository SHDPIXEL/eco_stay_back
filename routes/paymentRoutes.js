const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,

} = require('../controllers/paymentController');

router.post('/payment', createPayment);
router.get('/payment', getAllPayments);
router.get('/payment/:id', getPaymentById);

module.exports = router;
