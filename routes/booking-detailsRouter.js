const express = require("express");
const     router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByAgentId,
  getBookingsByUserId,
} = require("../controllers/booking-detailsController");

router.post('/booking-details',createBooking);
router.get('/booking-details',getAllBookings);
router.get('/booking-details/:id',getBookingById);
router.put("/booking-details/:id", updateBooking);
router.delete("/booking-details/:id", deleteBooking);
router.get("/booking-details/agent/:agentId", getBookingsByAgentId);
router.get("/booking-details/user/:user_Id", getBookingsByUserId);

module.exports = router;