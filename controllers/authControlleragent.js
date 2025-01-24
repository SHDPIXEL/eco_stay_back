const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Agent = require('../models/agent'); // Import the Agent model

async function login(req, res) {
    try {
        const { email, password } = req.body;
        // Debug: Log request body
        console.log('Request Body:', req.body);

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Fetch agent details from the database
        const agent = await Agent.findOne({ where: { email: email.toLowerCase() } });

        // Check if agent exists
        if (!agent) {
            return res.status(401).json({ message: 'Invalid credentials (Email)' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, agent.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials (Password)' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { agentId: agent.id, agentName: agent.name }, // Payload
            process.env.JWT_SECRET, // Secret
            { expiresIn: '1h' } // Options
        );

        // Successful response
        return res.status(200).json({ message: 'Login Successful', token });
    } catch (error) {
        console.error('Error during agent login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { login };

