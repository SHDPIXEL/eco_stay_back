const express = require('express')
const router = express.Router()
const { login,getAgentDetails } = require('../controllers/authControlleragent');

router.post('/login', login);
router.post('/agent-data',getAgentDetails);

module.exports = router;