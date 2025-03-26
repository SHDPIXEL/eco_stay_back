const express = require("express");
const router = express.Router();
const {
    getAllRooms,
    getRoomById,
    getRoomsByDate
} = require("../controllers/roomController");

router.get("/room",getAllRooms);
router.get("/room/:id",getRoomById);
router.post("/roombydate",getRoomsByDate)

module.exports = router;