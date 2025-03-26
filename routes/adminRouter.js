const express = require("express");
const { verifyAdminToken } = require('../controllers/authControlleradmin')
const router = express.Router();
const {
  createAgent,
  getAgents,
  updateAgentbyId,
  deleteAgent,
  createAvailability,
  getAvailability,
  deleteAvailability,
  createPackage,
  getAllPackages,
  updatePackage,
  deletePackage,
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAllBookings,
  getAllEnquiries,
  getAllPayments,
  getUsers,
  getBookingsGraph,
  createRoomStatus,
  getRoomStatus,
  updateRoomStatus,
  deleteRoomStatus
} = require("../controllers/adminController");


router.use(verifyAdminToken);

router.post('/agent',createAgent);
router.get('/agent',getAgents);
router.put('/agent/:id',updateAgentbyId)
router.delete('/agent/:id',deleteAgent)
router.post('/availability',createAvailability)
router.get('/availability',getAvailability)
router.delete('/availability/:id',deleteAvailability)
router.post("/package", createPackage);
router.get("/package", getAllPackages);
router.put("/package/:id", updatePackage);
router.delete("/package/:id", deletePackage);
router.post("/room",createRoom);
router.get("/room",getAllRooms);
router.get("/room/:id",getRoomById);
router.put("/room/:id",updateRoom);
router.delete("/room/:id",deleteRoom);
router.get("/booking-details",getAllBookings);
router.get("/enquiry",getAllEnquiries);
router.get("/payment",getAllPayments);
router.get("/user",getUsers);
router.get("/booking-details/graph",getBookingsGraph);
router.post("/createRoomStatus",createRoomStatus)
router.get("/getRoomStatus",getRoomStatus)
router.put("/updateRoomStatus/:id",updateRoomStatus)
router.delete("/deleteRoomStatus/:id",deleteRoomStatus)

module.exports = router;