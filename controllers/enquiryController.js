const Enquiry = require("../models/enquiry");

// Create a new enquiry
const createEnquiry = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
    } = req.body;

    const enquiry = await Enquiry.create({
      name,
      mobile,
      email,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
    });

    res.status(201).json({
      message: "Enquiry created successfully",
      enquiry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll();
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific enquiry by ID
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (enquiry) {
      res.status(200).json(enquiry);
    } else {
      res.status(404).json({ message: "Enquiry not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an enquiry by ID
const updateEnquiry = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
    } = req.body;

    const enquiry = await Enquiry.findByPk(req.params.id);
    if (enquiry) {
      enquiry.name = name || enquiry.name;
      enquiry.mobile = mobile || enquiry.mobile;
      enquiry.email = email || enquiry.email;
      enquiry.checkInDate = checkInDate || enquiry.checkInDate;
      enquiry.checkOutDate = checkOutDate || enquiry.checkOutDate;
      enquiry.adults = adults || enquiry.adults;
      enquiry.children = children || enquiry.children;
      enquiry.rooms = rooms || enquiry.rooms;

      await enquiry.save();
      res.status(200).json({
        message: "Enquiry updated successfully",
        enquiry,
      });
    } else {
      res.status(404).json({ message: "Enquiry not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an enquiry by ID
const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (enquiry) {
      await enquiry.destroy();
      res.status(200).json({ message: "Enquiry deleted successfully" });
    } else {
      res.status(404).json({ message: "Enquiry not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
};
