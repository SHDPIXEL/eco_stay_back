const express = require("express");
const router = express.Router();
const {getAgents, getAgentById,updateAgent } = require("../controllers/agentController");

router.get("/agent", getAgents);
router.get("/agent/:id", getAgentById);
router.put("/agent", updateAgent);

module.exports = router;
