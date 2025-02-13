const User = require("../models/user");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/uploadmiddleware");
const fs = require("fs");
const path = require("path");

// Create a new user
const createUser = async (req, res) => {
  try {
    // Use middleware for handling file upload
    upload.single("idProof")(req, res, async (err) => {
      // Handle file upload errors
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Destructure required fields from req.body
      const { name, email, phone, address, otp_verify, status } = req.body;

      // Ensure all required fields are provided
      if (!name || !email || !phone || !address || !status) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Process uploaded file for ID proof
      const idProof = req.file ? req.file.filename : null;

      // Create a new user record
      const newUser = await User.create({
        name,
        email,
        phone,
        address,
        idProof: JSON.stringify(idProof), // Store filename as JSON in the database
        otp_verify,
        status,
      });

      // Respond with success message
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          status: newUser.status,
        },
      });
    });
  } catch (error) {
    // Handle any other errors
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
    try {
        console.log("Received body:", req.body); // Log the entire request body
        
        let { email } = req.body; // Assuming email is passed in the request body
        return res.status(400).json(req.body);
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        console.log("Email before trimming:", email);
        email = email.trim(); // Trim any leading/trailing spaces
        
        // Log email after trimming
        console.log('Email after trimming:', email);

        // Case-insensitive email lookup
        const user = await User.findOne({
            where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), Sequelize.fn('LOWER', email)),
            attributes: ['id', 'name', 'idProof', 'phone', 'address', 'city', 'state', 'country', 'pincode', 'status'],
            logging: console.log, // Logs the SQL query for debugging
        });

        // Log the fetched user for debugging
        console.log('Fetched User:', user);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, userName: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ message: 'User logged in successfully', user, token });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ error: "Token is required" });
    }

    // Verify the token using the secret key stored in .env
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Extract user ID (or other parameters) from the decoded token
      const id = decoded.userId;

      // Find user details by primary key (assuming id is the user's primary key)
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Use middleware for handling file upload (if any)
      upload.single("idProof")(req, res, async (uploadErr) => {
        if (uploadErr) {
          return res.status(400).json({ error: uploadErr.message });
        }

        // Destructure fields from req.body
        const {
          name,
          email,
          phone,
          address,
          city,
          state,
          country,
          pincode,
          otp_verify,
          status,
        } = req.body;

        // If a new idProof file is uploaded, delete the old file and update the idProof field
        if (req.file) {
          if (user.idProof) {
            const oldFilePath = path.join(__dirname, "..", "uploads", JSON.parse(user.idProof));
            fs.unlink(oldFilePath, (deleteErr) => {
              if (deleteErr && deleteErr.code !== "ENOENT") {
                console.error("Error deleting old ID proof:", deleteErr.message);
              }
            });
          }
          // Update the idProof field with the new file's filename
          user.idProof = JSON.stringify(req.file.filename);
        }

        // Update other user fields (do not update idProof if not provided)
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.city = city || user.city;
        user.state = state || user.state;
        user.country = country || user.country;
        user.pincode = pincode || user.pincode;
        user.otp_verify = otp_verify || user.otp_verify;
        user.status = status || user.status;

        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
      });
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    // Find the user by primary key (ID)
    const user = await User.findByPk(req.params.id);

    if (user) {
      // Check if the user has an associated idProof file
      if (user.idProof) {
        // Construct the file path from the stored filename in the database
        const filePath = path.join(__dirname, "..", "uploads", JSON.parse(user.idProof));

        // Delete the file if it exists
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Error deleting the ID proof image:", err.message);
          }
        });
      }

      // Delete the user from the database
      await user.destroy();

      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user bookings by user ID
const getUserBookings = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: BookingDetails, as: "bookings" }],
    });
    if (user) {
      res.status(200).json(user.bookings);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUserBookings,
};  
