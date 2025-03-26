const Rooms = require("../models/rooms");
const RoomStatus = require("../models/roomStatus");

const getAllRooms = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const rooms = await Rooms.findAll({
      include: [
        {
          model: RoomStatus,
          required: false, // Include rooms even if they don't have a status
          where: { date: today }, // Fetch only today's availability
          attributes: ["status"],
        },
      ],
    });

    const formattedRooms = rooms.map((room) => {
      let availability = { available: 0, booked: 0 }; // Default availability

      if (room.RoomStatuses.length > 0) {
        try {
          const status = room.RoomStatuses[0].status;
          const parsedStatus = typeof status === "string" ? JSON.parse(status) : status;

          availability.available = parseInt(parsedStatus?.available, 10) || 0;
          availability.booked = parseInt(parsedStatus?.booked, 10) || 0;
        } catch (error) {
          console.error("Error parsing room status:", error);
        }
      }

      return {
        ...room.dataValues,
        availability,
      };
    });

    // Remove `RoomStatuses` before sending the response
    const responseData = formattedRooms.map(({ RoomStatuses, ...room }) => room);

    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(400).json({ error: error.message });
  }
};

const getRoomsByDate = async (req, res) => {
  try {
    console.log("date data",req.body)
    const { date } = req.body; // Get date from query params

    if (!date) {
      return res.status(400).json({ error: "Date is required." });
    }

    const rooms = await Rooms.findAll({
      include: [
        {
          model: RoomStatus,
          required: false, // Include rooms even if they don't have status for the date
          where: { date },
          attributes: ["status"],
        },
      ],
    });

    const formattedRooms = rooms.map((room) => {
      let availability = { available: 0, booked: 0 }; // Default availability

      if (room.RoomStatuses.length > 0) {
        try {
          const status = room.RoomStatuses[0].status;
          const parsedStatus = typeof status === "string" ? JSON.parse(status) : status;

          availability.available = parseInt(parsedStatus?.available, 10) || 0;
          availability.booked = parseInt(parsedStatus?.booked, 10) || 0;
        } catch (error) {
          console.error("Error parsing room status:", error);
        }
      }

      return {
        ...room.dataValues,
        availability,
      };
    });

    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("Error fetching rooms by date:", error);
    res.status(500).json({ error: "Internal server error" });
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
  getRoomsByDate
};
