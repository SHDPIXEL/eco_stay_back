const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin"); // Import the Admin model
const crypto = require("crypto");

const password = "admin@123";
const passwordHash = "$2a$12$ZdKaGwr349Ti75bTzPPOGOmEsFlXyc7gc8YXn1Z.L.n92tMUoYaHq";

const combined = `${password}:${passwordHash}`;

// Generate a hashed_token (SHA-256)
const hashed_token = crypto.createHash("sha256").update(combined).digest("hex");

// console.log("Hashed Token:", hashed_token);

async function login(req, res) {
  try {
    const { user_id_ent, password_ent } = req.body;

    // Debug: Log request body
    console.log("Request Body:", req.body);

    // Validate request body
    if (!user_id_ent || !password_ent) {
      return res
        .status(400)
        .json({ message: "User ID and password are required" });
    }

    // Fetch admin details from the database
    const admin = await Admin.findOne({ where: { user_id: user_id_ent } });

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials (User ID)" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password_ent, admin.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (Password)" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, adminName: admin.name }, // Payload
      process.env.JWT_SECRET, // Secret
      { expiresIn: "1h" } // Options
    );

    // Successful response
    return res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function verifyAdminToken(req, res, next) {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Assuming format: "Bearer <token>"
    console.log(token);
    if (!token) {
      return res.status(403).json({ message: "Token is required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Extract user ID (or other parameters) from the decoded token
      const id = decoded.adminId;
      console.log("decoded", decoded);
      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function directLoginAdmin(req, res) {
  try {
    const { user_id_ent, hashed_token } = req.body;

    if (!user_id_ent || !hashed_token) {
      return res
        .status(400)
        .json({ message: "User ID and hashed token are required" });
    }

    const admin = await Admin.findOne({ where: { user_id: user_id_ent } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.hashed_token !== hashed_token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Token matched — allow login
    const token = jwt.sign(
      { adminId: admin.id, adminName: admin.name }, // Payload
      process.env.JWT_SECRET, // Secret
      { expiresIn: "1h" } // Options
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        user_id: admin.user_id,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  login,
  verifyAdminToken,
  directLoginAdmin,
};
