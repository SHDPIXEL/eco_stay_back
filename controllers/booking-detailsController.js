const BookingDetails = require("../models/booking-details");
const Agent = require("../models/agent");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    console.log("data",req.body)
    const {
      user_Id,
      agentId,
      customerName,
      customerPhone,
      checkInDate,
      checkOutDate,
      roomType,
      number_of_cottages,
      selected_occupancy,
      amount,
      status = "pending", // Default value
      paymentStatus = "pending", // Default value
      idProof, // New field
      address, // New field
      city, // New field
      state, // New field
      country, // New field
      pincode, // New field
    } = req.body;

    // Validate idProof based on login type
    if (agentId && !idProof) {
      return res
        .status(400)
        .json({ error: "idProof is required for agent bookings." });
    }

    if (user_Id && idProof === null) {
      console.log("User login detected. idProof is optional.");
    }

    // Create a new booking record in the database
    const booking = await BookingDetails.create({
      user_Id,
      agentId,
      customerName,
      customerPhone,
      checkInDate,
      checkOutDate,
      roomType,
      number_of_cottages,
      selected_packages:"No Packages Available",
      selected_occupancy,
      amount,
      status,
      paymentStatus,
      idProof,
      address,
      city,
      state,
      country,
      pincode,
    });

    // Respond with a success message and the created booking
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    // Handle errors and respond with the error message
    res.status(400).json({ error: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingDetails.findAll({ include: Agent });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingDetails.findByPk(id, { include: Agent });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBookingsByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;
    const bookings = await BookingDetails.findAll({
      where: { agentId },
      include: Agent,
    });

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this agent" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBookingsByUserId = async (req, res) => {
  try {
    const { user_Id } = req.params;
    const bookings = await BookingDetails.findAll({
      where: { user_Id },
    });

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingDetails.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedBooking = await booking.update(req.body);
    res
      .status(200)
      .json({ message: "Booking updated successfully", updatedBooking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingDetails.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.destroy();
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByAgentId,
  getBookingsByUserId,
};
