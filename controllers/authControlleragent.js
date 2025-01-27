const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Agent = require("../models/agent"); // Import the Agent model

async function login(req, res) {
  try {
    const { email, password } = req.body;
    // Debug: Log request body
    console.log("Request Body:", req.body);

    // Validate request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Fetch agent details from the database
    const agent = await Agent.findOne({
      where: { email: email.toLowerCase() },
    });

    // Check if agent exists
    if (!agent) {
      return res.status(401).json({ message: "Invalid credentials (Email)" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (Password)" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { agentId: agent.id, agentName: agent.name, isAgent: true }, // Payload
      process.env.JWT_SECRET, // Secret
      { expiresIn: "1h" } // Options
    );

    // Successful response
    return res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Error during agent login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getAgentDetails = async (req, res) => {
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

      // Extract agent ID and isAgent from the decoded token
      const agentId = decoded.agentId;
      const isAgent = decoded.isAgent;

      console.log(decoded);

      // Find agent details by primary key (assuming agentId is the agent's primary key)
      const agent = await Agent.findByPk(agentId);

      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Embed the `isAgent` field within the agent details
      const agentDetails = {
        ...agent.toJSON(), // Convert Sequelize instance to a plain object
        isAgent,
      };

      // Return agent details
      res.status(200).json(agentDetails);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { login, getAgentDetails };
