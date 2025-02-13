const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUserBookings,
} = require("../controllers/userController");

// Create a new user
router.post("/user", createUser);

// Get all users
router.get("/user", getUsers);

// Get a user by ID
router.get("/user/:id", getUserById);
// Get a user by ID
router.get("/user/byemail", getUserByEmail);

// Update user information
router.put("/user", updateUser);

// Delete a user
router.delete("/user/:id", deleteUser);

// Get all bookings for a specific user
router.get("/user/:id/bookings", getUserBookings);

module.exports = router;
