const Rooms = require("../models/rooms");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Rooms.findAll();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Rooms.findByPk(req.params.id);
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
};
