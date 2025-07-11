require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");  // Import CORS middleware
const path = require('path')
require("./connection");
require('./models/roomStatus')

const PORT = process.env.PORT || 3000; // Use a fallback port if PORT is undefined

if (PORT === 3000) {
  console.error('Error: No port specified. Please set the PORT environment variable.');
  process.exit(1); // Exit the application with an error
}

const app = express();

// Middleware to parse JSON
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "0mb" }));

// Use CORS middleware for all routes
app.use(cors());  // Enable CORS for all routes

// Import routes
const authRouteradmin = require("./routes/authRouteradmin");
const adminRouter = require("./routes/adminRouter");
const agentRouter = require("./routes/agentRouter");
const availabilityRouter = require("./routes/availabilityRouter");
const bookingdetailsRouter = require("./routes/booking-detailsRouter");
const enquiryRouter = require("./routes/enquiryRoutes");
const packageRouter = require("./routes/packageRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const roomRouter = require("./routes/roomsRouter");
const userRouter = require("./routes/userRouter");
const autRouteruser = require("./routes/authRouteruser");
const authRouteragent = require("./routes/authRouteragent")

// Middleware to parse JSON
app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.status(403).json({
      status: true,
      message: "Not allowed"
  });
});

// Serve static files from the "assets" folder
app.use('/assets', (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // 👈 Allow cross-origin requests
  next();
}, express.static(path.join(__dirname, 'assets')));

// Admin routes
app.use("/api/auth", authRouteradmin);
app.use("/admin", adminRouter);

// User routes
app.use("/auth/user",autRouteruser)
app.use("/availabilities", availabilityRouter);
app.use("/bookings", bookingdetailsRouter);
app.use("/enquiries", enquiryRouter);
app.use("/packages", packageRouter);
app.use("/payments", paymentRouter);
app.use("/rooms", roomRouter);
app.use("/users", userRouter);

//agent routes
app.use("/agents", agentRouter);
app.use("/auth/agent", authRouteragent);


// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});