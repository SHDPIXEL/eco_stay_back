const Agent = require("../models/agent");

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

module.exports = {
  getAgents,
  getAgentById,
};
