require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const User = require("../models/user");
const Agent = require("../models/agent");
const BookingDetails = require("../models/booking-details");
const PaymentDetails = require("../models/payment-details");
const Rooms = require("../models/rooms");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const upload = require("../middleware/uploadmiddleware");

// Mock in-memory storage for OTPs (use a database or caching system like Redis for production)
const otpStore = {};
const senderIds = ["VIRYAA", "VIRYWT", "VWILDT"];

const generateUniqueId = () => {
  return `${crypto.randomBytes(4).toString("hex")}-${crypto
    .randomBytes(4)
    .toString("hex")}-${crypto.randomBytes(4).toString("hex")}`;
};

const generateReceiptId = () => {
  const randomNumbers = crypto.randomBytes(4).toString("hex"); // Generates a random 8-character hex string
  return `receipt_ecostay_${randomNumbers}`;
};

async function sendOtp(req, res) {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP in-memory or in a caching system (like Redis)
    otpStore[phoneNumber] = otp;

    // Send OTP via SMS using InsignSMS API with random senderId
    const sendOtpResponse = await sendOtpViaSms(phoneNumber, otp);

    return res.status(200).json({ message: sendOtpResponse });
  } catch (error) {
    console.error("Error during OTP sending:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function sendOtpViaSms(phoneNumber, otp) {
  // Randomly select a senderId from the list
  const senderId = senderIds[Math.floor(Math.random() * senderIds.length)];

  const message = `Dear Sir / Ma'am, Your OTP for Mobile verification is ${otp} use this Code to validate your verification, Regards, Virya Wildlife Tours`;

  const apiUrl =
    process.env.OTP_BASE_SEND +
    `?username=viryawildlifetours&password=viryawildlifetours&senderid=${senderId}&message=${encodeURIComponent(
      message
    )}&numbers=${phoneNumber}`;

  try {
    const response = await axios.get(apiUrl);
    if (response.status === 200) {
      console.log(`OTP ${otp} sent to ${phoneNumber} via senderId ${senderId}`);
      return "OTP sent successfully"; // Return a success message
    } else {
      console.error("Error sending OTP:", response.data);
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    console.error("Error during API request to InsignSMS:", error);
    throw new Error("Failed to send OTP");
  }
}

async function verifyOtp(req, res) {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    // Check if OTP matches
    const storedOtp = otpStore[phoneNumber];
    if (!storedOtp || storedOtp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" }); // Return 401 for invalid OTP
    }

    // OTP is valid, find or create user
    let user = await User.findOne({ where: { phone: phoneNumber } });
    if (!user) {
      // Create new user with "Active" status and current timestamp
      user = await User.create({
        phone: phoneNumber,
        status: "Active",
        otp_verified_at: new Date(),
      });
    } else {
      // Update user only if the status is not "Active"
      if (user.status !== "Active") {
        user.status = "Active";
      }
      user.otp_verified_at = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, isAgent: false }, // Payload
      process.env.JWT_SECRET, // Secret
      { expiresIn: "1h" } // Options
    );

    // Cleanup OTP
    delete otpStore[phoneNumber];

    return res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
// Adjust the path based on your project structure

const getuserdetails = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ error: "Token is required" });
    }

    // Verify the token using the secret key stored in .env
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Extract user ID and isAgent from the decoded token
      const id = decoded.userId;
      const isAgent = decoded.isAgent;

      console.log(decoded);

      // Find user details by primary key (assuming id is the user's primary key)
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Embed `isAgent` field within the user details object
      const userDetails = {
        ...user.toJSON(), // Convert Sequelize instance to a plain object
        isAgent,
      };

      // Return user details
      res.status(200).json(userDetails);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginOrRegisterUser = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const {
      phoneNumber,
      otp,
      firstname,
      lastname,
      email,
      address,
      city,
      state,
      country,
      pincode,
    } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // If OTP is missing, generate and send it
    if (!otp) {
      const generatedOtp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      otpStore[phoneNumber] = generatedOtp;
      console.log(`Generated OTP for ${phoneNumber}:`, generatedOtp);

      const senderId = senderIds[Math.floor(Math.random() * senderIds.length)];
      const message = `Dear Sir / Ma'am, Your OTP for Mobile verification is ${generatedOtp} use this Code to validate your verification, Regards, Virya Wildlife Tours`;

      const apiUrl =
        process.env.OTP_BASE_SEND +
        `?username=viryawildlifetours&password=viryawildlifetours&senderid=${senderId}&message=${encodeURIComponent(
          message
        )}&numbers=${phoneNumber}`;

      try {
        const response = await axios.get(apiUrl);

        if (response.status === 200) {
          console.log(`OTP ${generatedOtp} successfully sent to ${phoneNumber}`);
          return res.status(200).json({ message: "OTP sent successfully" });
        } else {
          console.error("Failed to send OTP:", response.data);
          return res.status(500).json({ message: "Failed to send OTP" });
        }
      } catch (error) {
        console.error("Error sending OTP:", error.message);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    }

    // Validate OTP
    if (!otpStore[phoneNumber] || otpStore[phoneNumber] !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

 // Check if a user exists with the given phone number
    let user = await User.findOne({ where: { phone: phoneNumber } });

    if (user) {
      user.status = "Active";
      user.otp_verified_at = new Date();
      await user.save();

      // Cleanup OTP
      delete otpStore[phoneNumber];

      // Generate token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "User already exists with this phone number. Logging in...",
        token,
        user,
      });
    }

    if (!user) {
      // Register a new user
      if (
        !firstname ||
        !lastname ||
        !email ||
        !address ||
        !city ||
        !state ||
        !country ||
        !pincode
      ) {
        console.log("Missing fields:", {
          firstname,
          lastname,
          email,
          address,
          city,
          state,
          country,
          pincode,
        });
        return res.status(400).json({ error: "All fields are required" });
      }

      user = await User.create({
        name: `${firstname} ${lastname}`,
        email,
        phone: phoneNumber,
        address,
        city,
        state,
        country,
        pincode,
        otp_verified_at: new Date(),
        status: "Active",
      });

      // Cleanup OTP
      delete otpStore[phoneNumber];

      // Generate token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "User created successfully",
        token,
        user,
      });
    } else {
      // Update existing user
      user.status = "Active";
      user.otp_verified_at = new Date();

      await user.save();

      // Cleanup OTP
      delete otpStore[phoneNumber];

      // Generate token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user,
      });
    }
  } catch (error) {
    console.error("Error in login/register:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const order = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is missing" });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if the token belongs to a user or an agent
    const userId = decoded.userId;
    const agentId = decoded.agentId;

    if (!userId && !agentId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    let customerName, customerPhone, agent_Id;

    const {
      amt,
      checkInDate,
      checkOutDate,
      roomType,
      number_of_cottages,
      selected_packages,
      selected_occupancy,
      name,
      phone,
      city,
      pincode,
      state,
      country,
      address,
    } = req.body;

    if (userId) {
      // Handle user booking
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      customerName = user.name;
      customerPhone = user.phone;
    } else if (agentId) {
      // Handle agent booking
      const agent = await Agent.findByPk(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      customerName = name;
      customerPhone = phone;
      agent_Id = agent.id
    }
    
    if (
      !customerName ||
      !customerPhone ||
      !checkInDate ||
      !checkOutDate ||
      !roomType ||
      !number_of_cottages ||
      !selected_packages ||
      !selected_occupancy
    ) {
      return res
        .status(400)
        .json({ message: "Missing required booking details",customerName,customerPhone,checkInDate,checkOutDate,roomType,number_of_cottages,selected_packages,selected_occupancy });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receiptId = generateReceiptId();

    const options = {
      amount: amt * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: receiptId,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occurred");

    const newBooking = await BookingDetails.create({
      user_Id: userId || null, // Null if agent is booking
      agentId: agent_Id || null, // Null if user is booking
      customerName,
      customerPhone,
      checkInDate,
      checkOutDate,
      roomType,
      number_of_cottages,
      selected_packages,
      selected_occupancy,
      status: "pending",
      city,
      state,
      country,
      pincode,
      amount: JSON.parse(amt),
      paymentStatus: "pending", // Default to pending
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
      bookingDetails: newBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};


const orderSuccess = async (req, res) => {
  try {
    // Extracting payment details from the request body
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      booking,
      amount,
    } = req.body;

    // Creating our own digest for verification
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    // Verifying the signature
    if (digest !== razorpaySignature) {
      return res.status(400).json({ msg: "Transaction not legit!" });
    }

    // Fetch the booking using the provided booking ID
    const bookingData = await BookingDetails.findOne({
      where: { id: booking }, // Assuming `booking` contains the booking ID
    });

    if (!bookingData) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Fetch room ID and booked rooms from the booking data
    const room_id_fetch = bookingData.roomType.split("_")[1];
    const bookedRooms = bookingData.number_of_cottages;
    
    // Fetch the room using the provided room ID
    const roomData = await Rooms.findOne({
      where: { id: room_id_fetch },
    });
    
    if (!roomData) {
      console.log("Room not found in database"); // Debugging for room not found case
      return res.status(404).json({ message: "Room not found" });
    }
    
    // Ensure that roomData.status is properly parsed from JSON (since it's stored as TEXT)
    
    let roomStatus;
    try {
      roomStatus = JSON.parse(roomData.status); // Parse status as JSON
    } catch (error) {
      console.error("Error parsing room status:", error);
      return res.status(500).json({ message: "Room data is corrupted." });
    }
    
    // Extract available and booked rooms safely
    const availableRooms = parseInt(roomStatus?.available || "0", 10);
    const bookedRoomsInRoom = parseInt(roomStatus?.booked || "0", 10);
    
    
    // Validate if available and booked room values are correct numbers
    if (isNaN(availableRooms) || isNaN(bookedRoomsInRoom)) {
      console.log("Room data is corrupted - available or booked values are not valid numbers.");
      return res.status(500).json({ message: "Room data is corrupted." });
    }
    
    // Check if there are enough available rooms to book
    if (availableRooms < bookedRooms) {
      console.log("Not enough rooms available. Available:", availableRooms, "Requested:", bookedRooms);
      return res.status(400).json({ message: "Not enough rooms available." });
    }
    
    // Update room availability and booking status
    roomStatus.available -= bookedRooms; // Subtract from available rooms
    roomStatus.booked += bookedRooms; // Add to booked rooms
    
    // Convert roomStatus back to a string before saving (since it's stored as TEXT)
    roomData.status = JSON.stringify(roomStatus);
    
    // Save the updated room data
    await roomData.save();
    console.log("Room data saved successfully after update.");

    // Update the booking status to "confirmed" and set paymentStatus to "paid"
    bookingData.status = "confirmed";
    bookingData.paymentStatus = "paid";
    await bookingData.save();  // Save the updated booking data

    // Create a new entry in the PaymentDetails table
    const newPayment = await PaymentDetails.create({
      bookingId: bookingData.id, // Foreign key to the BookingDetails table
      orderId: razorpayOrderId,
      transactionId: razorpayPaymentId,
      amount: amount / 100,
      status: "success", // Payment status after successful verification
      paymentDate: new Date(),
      remarks: "Payment verified successfully",
    });

    // Respond with success message
    res.json({
      msg: "Payment success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      bookingId: bookingData.booking_id,
      paymentDetails: newPayment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getUserByEmail = async (req, res) => {
    try {
        let { name, email, idProof } = req.body; // Assuming email is passed in the request body
        let modal = false;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
      
        // Case-insensitive email lookup
        const user = await User.findOne({
          where: { email }, // ✅ Correct usage
          attributes: ['id', 'name', 'idProof', 'phone', 'address', 'city', 'state', 'country', 'pincode', 'status'],
        });

        if (!user) {
          modal= true;
          const submittedData = req.body
           return res.status(200).json({ message: 'User not found',submittedData,modal });
        }

        if(user.phone === null){
          modal = true;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, userName: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ message: 'User logged in successfully',modal, token });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const registerOrLoginWithGoogle = async (req, res) => {
  try {
    const { name, email, idProof, phone } = req.body;

    if (!email || !phone) {
      console.log("Email or phone is missing in the request");
      return res.status(400).json({ message: "Email and phone are required" });
    }

// Check if user exists with the given email
    let user = await User.findOne({ where: { phone } });
    console.log("User found with phone:", user);

    if (user) {
       user.name = user.name || name;
       user.email = user.email || email;
       user.idProof = user.idProof || idProof;
    }

    if (!user) {
      console.log("User not found, creating a new user...");
      // If user does not exist, create a new one
      user = await User.create({ name, email, idProof, phone });
      console.log("New user created:", user);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, isAgent: false }, // Payload
      process.env.JWT_SECRET, // Secret
      { expiresIn: "1h" } // Options
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in registerOrLoginWithGoogle:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  sendOtp,
  verifyOtp,
  getuserdetails,
  loginOrRegisterUser,
  order,
  orderSuccess,
  getUserByEmail,
  registerOrLoginWithGoogle
};
