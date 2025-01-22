const express = require("express");
const router = express.Router();
const {
    getAllRooms,
    getRoomById,
} = require("../controllers/roomController");

router.get("/room",getAllRooms);
router.get("/room/:id",getRoomById);

module.exports = router;