const express = require("express");
const router = express.Router();
const { getAvailabilityByRoomId } = require("../controllers/availabilityController");

router.get('/availability/:roomId',getAvailabilityByRoomId)

module.exports = router;