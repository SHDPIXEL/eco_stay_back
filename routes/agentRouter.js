const express = require("express");
const router = express.Router();
const {getAgents, getAgentById } = require("../controllers/agentController");

router.get("/agent", getAgents);
router.get("/agent/:id", getAgentById);

module.exports = router;
