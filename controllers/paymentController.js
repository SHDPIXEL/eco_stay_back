const PaymentDetails = require("../models/payment-details");
const BookingDetails = require("../models/booking-details");

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, transactionId, amount, status, remarks } =
      req.body;

    // Ensure the booking exists
    const booking = await BookingDetails.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const payment = await PaymentDetails.create({
      bookingId,
      paymentMethod,
      transactionId,
      amount,
      status,
      remarks,
    });

    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentDetails.findAll({ include: BookingDetails });
    res.status(200).json({ payments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await PaymentDetails.findByPk(req.params.id, {
      include: BookingDetails,
    });
    if (payment) {
      res.status(200).json({ payment });
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};





module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
};
