const Availability = require('../models/availability'); // Adjust the path if necessary
const Rooms = require('../models/rooms');// Adjust the path if necessary

const getAvailabilityByRoomId = async (req, res) => {
    try {
      const { roomId } = req.params;
  
      // Check if the room exists
      const room = await Rooms.findByPk(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      const availability = await Availability.findOne({
        where: { roomId },
      });
  
      if (!availability) {
        return res.status(404).json({ message: 'Availability not found for this room' });
      }
  
      res.status(200).json(availability);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  module.exports = {
    getAvailabilityByRoomId
  }