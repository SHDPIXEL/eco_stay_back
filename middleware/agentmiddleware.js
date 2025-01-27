const jwt = require('jsonwebtoken');
const Agent = require('../models/agent');

const authenticateAgent = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the agent using the ID from the decoded token
    const agent = await Agent.findOne({ where: { id: decoded.agentId } });

    // If the agent does not exist, deny access
    if (!agent) {
      return res.status(403).json({ error: 'Access Denied. Invalid Agent.' });
    }

    // Attach the agent to the request object for later use
    req.agent = agent;
    req.isAgent = true; // Set the isAgent flag to true for agents

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Respond with an error if token verification fails
    res.status(401).json({ error: 'Invalid Token.', details: err.message });
  }
};

module.exports = {
  authenticateAgent,
};
