const Agent = require("../models/agent"); // Adjust the path as needed
const Availability = require("../models/availability"); // Adjust the path if necessary
const Rooms = require("../models/rooms"); // Adjust the path if necessary
const Package = require("../models/package");
const BookingDetails = require("../models/booking-details");
const Enquiry = require("../models/enquiry");
const PaymentDetails = require("../models/payment-details");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt"); // Assuming you're using Sequelize ORM // Import your Booking model
const moment = require("moment");
const upload = require("../middleware/uploadmiddleware");

//{agent controller}// Import bcrypt for password hashing

const createAgent = async (req, res) => {
  try {
    // Use middleware for handling file upload
    upload.single("idProof")(req, res, async (err) => {
      // Handle file upload errors
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Destructure required fields from req.body
      const { name, email, phone, address, city, state, country, pincode, status, offers, password } =
        req.body;

      // Ensure all required fields are provided
      if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !country ||
        !pincode ||
        !status ||
        !offers ||
        !password
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // // Validate phone number (must be exactly 10 digits)
      // const phoneRegex = /^\d{10}$/;
      // if (!phoneRegex.test(phone)) {
      //   return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
      // }

      // Check if the agent already exists
      const existingAgent = await Agent.findOne({ where: { email } });
      if (existingAgent) {
        return res.status(409).json({ error: "Agent already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Process uploaded file for ID proof
      const idProof = req.file ? req.file.filename : null;

      // Create a new agent record
      const newAgent = await Agent.create({
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        pincode,
        idProof: JSON.stringify(idProof),
        status,
        offers,
        password: hashedPassword, // Save hashed password
      });

      // Respond with success message
      res.status(201).json({
        message: "Agent created successfully",
        agent: {
          id: newAgent.id,
          name: newAgent.name,
          email: newAgent.email,
          phone: newAgent.phone,
          address: newAgent.address,
          status: newAgent.status,
          offers: newAgent.offers,
        },
      });
    });
  } catch (error) {
    // Handle any other errors
    console.error("Error creating agent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll();
    res.status(200).json(agents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAgentbyId = async (req, res) => {
  try {
    // Use middleware for handling file upload
    upload.single("idProof")(req, res, async (err) => {
      // Handle file upload errors
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Get the agent ID from the route parameters
      const { id } = req.params;

      // Get new data from the request body
      const { name, email, phone, address,city,state,country,pincode, status, offers, password } =
        req.body;

      // Get the uploaded file for ID proof
      const idProof = req.file ? req.file.filename : null;

      // Find the agent by ID
      const agent = await Agent.findByPk(id);

      if (agent) {
        // Update the agent fields if provided
        agent.name = name || agent.name;
        agent.email = email || agent.email;
        agent.phone = phone || agent.phone;
        agent.address = address || agent.address;
        agent.city = city || agent.city;
        agent.state = state || agent.state;
        agent.country = country || agent.country;
        agent.pincode = pincode || agent.pincode;

        // Update ID proof only if a new file is uploaded
        if (idProof) {
          agent.idProof = idProof;
        }

        agent.status = status || agent.status;
        agent.offers = offers || agent.offers;

        // If a new password is provided, hash it and update
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          agent.password = hashedPassword;
        }

        // Save the updated agent to the database
        await agent.save();

        // Respond with a success message
        res.status(200).json({
          message: "Agent updated successfully",
          agent: {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
            address: agent.address,
            status: agent.status,
            offers: agent.offers,
          },
        });
      } else {
        // If the agent is not found, send a 404 error
        res.status(404).json({ message: "Agent not found" });
      }
    });
  } catch (error) {
    // Handle any errors
    console.error("Error updating agent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteAgent = async (req, res) => {
  try {
    // Find the agent by primary key
    const agent = await Agent.findByPk(req.params.id);

    if (agent) {
      // Check if the agent has an associated idProof
      if (agent.idProof) {
        const filePath = path.join(__dirname, "..", "uploads", JSON.parse(agent.idProof)); // Adjust the path as per your directory structure

        // Delete the file if it exists
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") {
            // Log only unexpected errors
            console.error("Error deleting idProof:", err.message);
          }
        });
      }

      // Delete the agent from the database
      await agent.destroy();

      res.status(200).json({ message: "Agent and associated ID proof deleted successfully" });
    } else {
      res.status(404).json({ message: "Agent not found" });
    }
  } catch (error) {
    console.error("Error deleting agent:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//{availability controller}
const createAvailability = async (req, res) => {
  try {
    const { room_id, date, count } = req.body;

    // Check if the room exists
    const room = await Rooms.findByPk(room_id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const availability = await Availability.create({
      room_id: room.id,
      date,
      count,
    });

    console.log(availability);

    res
      .status(201)
      .json({ message: "Availability created successfully", availability });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.findAll();
    res.status(200).json(availability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the availability by ID
    const availability = await Availability.findByPk(id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    await availability.destroy();
    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//{Package controller}
const createPackage = async (req, res) => {
  try {
    const { name, long_description, short_description, package_price, status } =
      req.body;
    console.log(req.body);

    const newPackage = await Package.create({
      name,
      long_description,
      short_description,
      package_price,
      status,
    });

    res
      .status(201)
      .json({ message: "Package created successfully", package: newPackage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get package by ID
const getPackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    const packageDetails = await Package.findByPk(packageId);

    if (packageDetails) {
      res.status(200).json(packageDetails);
    } else {
      res.status(404).json({ message: "Package not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, long_description, short_description, package_price, status } =
      req.body;

    const packageToUpdate = await Package.findByPk(id);

    if (packageToUpdate) {
      packageToUpdate.name = name || packageToUpdate.name;
      packageToUpdate.long_description =
        long_description || packageToUpdate.long_description;
      packageToUpdate.short_description =
        short_description || packageToUpdate.short_description;
      packageToUpdate.package_price =
        package_price || packageToUpdate.package_price;
      packageToUpdate.status = status || packageToUpdate.status;

      await packageToUpdate.save();
      res.status(200).json({
        message: "Package updated successfully",
      });
    } else {
      res.status(404).json({ message: "Package not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    const packageToDelete = await Package.findByPk(packageId);

    if (packageToDelete) {
      await packageToDelete.destroy();
      res.status(200).json({ message: "Package deleted successfully" });
    } else {
      res.status(404).json({ message: "Package not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//{Rooms controller}
const createRoom = async (req, res) => {
  try {
    // Use middleware for handling file upload
    upload.array("room_images", 4)(req, res, async (err) => {
      // Handle file upload errors
      if (err) {
        return res.status(400).json({ error: err });
      }
      // Process uploaded images
      const roomImages = req.files
        ? req.files.map((file) => file.filename)
        : [];

      let responseBody;

      if (typeof req.body.room_data === "string") {
        responseBody = JSON.parse(req.body.room_data);
      } else if (typeof req.body.room_data === "object") {
        responseBody = req.body.room_data;
      } else {
        throw new Error("Invalid room_data format");
      }

      // Access the first object in the array
      const roomData = responseBody[0];
      const {
        package_ids,
        room_name,
        description,
        type,
        capacity,
        single_base_price,
        double_base_price,
        triple_base_price,
        single_new_price,
        double_new_price,
        triple_new_price,
        status,
        amenities,
      } = roomData;

      //return res.status(401).json({ message: "test" });
      // Create a new room record
      const room = await Rooms.create({
        package_ids,
        room_name,
        description,
        type,
        capacity,
        single_base_price,
        double_base_price,
        triple_base_price,
        single_new_price,
        double_new_price,
        triple_new_price,
        status: JSON.stringify(status),
        room_images: JSON.stringify(roomImages), // Store filenames as JSON in the database
        amenities,
      });

      // Respond with success message
      res.status(201).json({ message: "Room created successfully", room });
    });
  } catch (error) {
    // Handle any other errors
    res.status(500).json({ error: error.message });
  }
};

// Get all rooms
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

// Update a room
const updateRoom = async (req, res) => {
  try {
    // Use middleware for handling file upload
    upload.array("room_images", 4)(req, res, async (err) => {
      // Handle file upload errors
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Find the room by ID
      const room = await Rooms.findByPk(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const newImages = req.files ? req.files.map((file) => file.filename) : [];
      const updatedRoomImages =
        newImages.length > 0
          ? JSON.stringify(newImages) // Use new images if uploaded
          : room.room_images;

      let responseBody;

      if (typeof req.body.room_data === "string") {
        responseBody = JSON.parse(req.body.room_data);
      } else if (typeof req.body.room_data === "object") {
        responseBody = req.body.room_data;
      } else {
        throw new Error("Invalid room_data format");
      }

      // Destructure other fields from req.body
      const {
        package_ids,
        room_name,
        description,
        type,
        capacity,
        single_base_price,
        double_base_price,
        triple_base_price,
        single_new_price,
        double_new_price,
        triple_new_price,
        status,
        amenities,
      } = responseBody;

      // Update room details
      room.package_ids = package_ids || room.package_ids;
      room.room_name = room_name || room.room_name;
      room.description = description || room.description;
      room.type = type || room.type;
      room.capacity = capacity || room.capacity;
      room.single_base_price = single_base_price || room.single_base_price;
      room.double_base_price = double_base_price || room.double_base_price;
      room.triple_base_price = triple_base_price || room.triple_base_price;
      room.single_new_price = single_new_price || room.single_new_price;
      room.double_new_price = double_new_price || room.double_new_price;
      room.triple_new_price = triple_new_price || room.triple_new_price;
      room.status = status || room.status;
      room.room_images = updatedRoomImages; // Update with new or existing images
      room.amenities = amenities || room.amenities;

      console.log(room);
      // Save the updated room
      await room.save();
      res.status(200).json({ message: "Room updated successfully" });
    });
  } catch (error) {
    // Handle any other errors
    res.status(500).json({ error: error.message });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    // Find the room by primary key
    const room = await Rooms.findByPk(req.params.id);

    if (room) {
      // Check if the room has associated images
      if (room.room_images) {
        const roomImages = JSON.parse(room.room_images); // Parse the JSON string to get the array of filenames

        roomImages.forEach((filename) => {
          const filePath = path.join(__dirname, "..", "uploads", filename); // Adjust the path as needed

          // Delete each file
          fs.unlink(filePath, (err) => {
            if (err && err.code !== "ENOENT") {
              console.error(`Error deleting file ${filename}:`, err.message);
            }
          });
        });
      }

      // Delete the room from the database
      await room.destroy();

      res.status(200).json({ message: "Room and associated images deleted successfully" });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    console.error("Error deleting room:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// {Bookin-details}
const getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingDetails.findAll({ include: Agent });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// {Enquiry}
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll();
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//{Payment Details}
const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentDetails.findAll({ include: BookingDetails });
    res.status(200).json({ payments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// {user}
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//BookingsGraph
async function getBookingsGraph(req, res) {
  try {
    // Get the current date
    const today = moment().startOf("day");
    const sevenDaysAgo = moment(today).subtract(6, "days");

    // Fetch bookings from the last 7 days, including today
    const bookings = await BookingDetails.findAll({
      where: {
        createdAt: {
          [Op.between]: [sevenDaysAgo.toDate(), today.endOf("day").toDate()],
        },
      },
      attributes: ["createdAt"], // Fetch only the creation date
    });

    // Initialize an array with all the dates for the last 7 days
    const dateCounts = Array.from({ length: 7 }, (_, i) => {
      const date = moment(sevenDaysAgo).add(i, "days");
      return {
        date: date.format("YYYY-MM-DD"), // Format the date as a string
        booking: 0, // Initial booking count is zero
      };
    });

    // Count bookings for each day
    bookings.forEach((booking) => {
      const bookingDate = moment(booking.createdAt).format("YYYY-MM-DD");
      const dayEntry = dateCounts.find((entry) => entry.date === bookingDate);
      if (dayEntry) {
        dayEntry.booking += 1; // Increment booking count
      }
    });

    // Respond with the data
    res.status(200).json({
      message: "Bookings data for the last 7 days",
      data: dateCounts,
    });
  } catch (error) {
    console.error("Error fetching bookings graph data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createAgent,
  getAgents,
  updateAgentbyId,
  deleteAgent,
  createAvailability,
  getAvailability,
  deleteAvailability,
  createPackage,
  getAllPackages,
  getPackageById,
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
};
