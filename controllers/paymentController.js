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

const getPaymentsByUserId = async (req, res) => {
  try {
    const { user_Id } = req.params; // Ensure correct parameter name

    const payments = await PaymentDetails.findAll({
      include: {
        model: BookingDetails,
        attributes: ["id", "user_Id"],
      },
      where: {
        "$BookingDetail.user_Id$": user_Id, // Ensure Sequelize recognizes alias
      },
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found for this user" });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments by user:", error);
    res.status(500).json({ error: error.message });
  }
};


const getPaymentsByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;

    const payments = await PaymentDetails.findAll({
      include: {
        model: BookingDetails,
        attributes: ["id", "agentId", "user_Id"],
      },
      where: {
        "$BookingDetail.agentId$": agentId, // Ensure Sequelize recognizes alias
      },
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found for this agent" });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments by agent:", error);
    res.status(500).json({ error: error.message });
  }
};






module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByAgentId
};
