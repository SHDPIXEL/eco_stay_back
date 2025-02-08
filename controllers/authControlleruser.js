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

    // Handle OTP generation and sending
    if (!otp) {
      const generatedOtp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      otpStore[phoneNumber] = generatedOtp;

      const senderId = senderIds[Math.floor(Math.random() * senderIds.length)];
      const message = `Dear Sir / Ma'am, Your OTP for Mobile verification is ${generatedOtp}. Use this code to validate your verification. Regards, Virya Wildlife Tours`;

      const apiUrl = `${process.env.OTP_BASE_SEND}?username=viryawildlifetours&password=viryawildlifetours&senderid=${senderId}&message=${encodeURIComponent(
        message
      )}&numbers=${phoneNumber}`;

      try {
        const response = await axios.get(apiUrl);
        if (response.status === 200) {
          console.log(`OTP ${generatedOtp} sent to ${phoneNumber}`);
          return res.status(200).json({ message: "OTP sent successfully" });
        } else {
          throw new Error("Failed to send OTP");
        }
      } catch (error) {
        console.error("Error sending OTP:", error.message);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    }

    // Validate OTP
    const storedOtp = otpStore[phoneNumber];
    if (!storedOtp || storedOtp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Process file upload asynchronously
    const processFileUpload = () =>
      new Promise((resolve, reject) => {
        upload.single("idProof")(req, res, (err) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(req.file ? req.file.filename : null);
          }
        });
      });

    const idProof = await processFileUpload().catch((err) => {
      console.error("File upload error:", err.message);
      return res.status(400).json({ error: err.message });
    });

    if (res.headersSent) return; // Ensure no further processing if an error response is already sent

    // Check if the user exists
    let user = await User.findOne({ where: { phone: phoneNumber } });

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
        return res.status(400).json({ error: "All fields are required" });
      }

      const emailUser = await User.findOne({ where: { email } });
      if (emailUser) {
        return res
          .status(409)
          .json({ error: "User already exists with this email" });
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
        idProof: JSON.stringify(idProof),
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

      if (idProof) {
        user.idProof = JSON.stringify(idProof);
      }

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

    let customerName, customerPhone;

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
        .json({ message: "Missing required booking details" });
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
      agent_Id: agentId || null, // Null if user is booking
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
    
    const room_id_fetch = bookingData.roomType.split("_")[1];
    const bookedRooms = bookingData.number_of_cottages;

    // Fetch the room using the provided booking ID
    const roomData = await Rooms.findOne({
      where: { id: room_id_fetch },
    });

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    const room_status = roomData.status;

    roomData.status.available -= bookedRooms; // Subtract from available
    roomData.status.booked += bookedRooms; // Add to booked
    await roomData.save();

    // Update the booking status to "confirmed" and set paymentStatus to "paid"
    bookingData.status = "confirmed";
    bookingData.paymentStatus = "paid";
    await bookingData.save();

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
      status:true // Return payment details in the response
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getuserdetails,
  loginOrRegisterUser,
  order,
  orderSuccess,
};
