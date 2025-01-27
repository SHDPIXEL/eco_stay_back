const jwt = require("jsonwebtoken");
const Agent = require("../models/agent");
const upload = require("../middleware/uploadmiddleware");
const bcrypt = require("bcrypt"); 

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll();
    res.status(200).json(agents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    if (agent) {
      res.status(200).json(agent);
    } else {
      res.status(404).json({ message: "Agent not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAgent = async (req, res) => {
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

      // Extract agent ID from the decoded token
      const agentId = decoded.agentId;

      // Find agent details by primary key (assuming agentId is the agent's primary key)
      const agent = await Agent.findByPk(agentId);

      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
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
          status,
          offers,
          password,
        } = req.body;

        // If a new idProof file is uploaded, delete the old file and update the idProof field
        if (req.file) {
          if (agent.idProof) {
            const oldFilePath = path.join(__dirname, "..", "uploads", JSON.parse(agent.idProof));
            fs.unlink(oldFilePath, (deleteErr) => {
              if (deleteErr && deleteErr.code !== "ENOENT") {
                console.error("Error deleting old ID proof:", deleteErr.message);
              }
            });
          }
          // Update the idProof field with the new file's filename
          agent.idProof = JSON.stringify(req.file.filename);
        }

        // Update other agent fields
        agent.name = name || agent.name;
        agent.email = email || agent.email;
        agent.phone = phone || agent.phone;
        agent.address = address || agent.address;
        agent.city = city || agent.city;
        agent.state = state || agent.state;
        agent.country = country || agent.country;
        agent.pincode = pincode || agent.pincode;
        agent.status = status || agent.status;
        agent.offers = offers || agent.offers;

        // If a new password is provided, hash it and update
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          agent.password = hashedPassword;
        }

        await agent.save();

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
      });
    });
  } catch (error) {
    console.error("Error updating agent:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAgents,
  getAgentById,
  updateAgent
};
