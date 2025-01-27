const Rooms = require("../models/rooms");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Rooms.findAll();

    // Ensure `package_ids` and `amenities` are stringified
    const formattedRooms = rooms.map((room) => {
      return {
        ...room.dataValues, // Ensure you're accessing the dataValues from Sequelize
        package_ids: JSON.stringify(room.package_ids),
        amenities: JSON.stringify(room.amenities),
      };
    });

    console.log(formattedRooms);
    res.status(200).json(formattedRooms);
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
