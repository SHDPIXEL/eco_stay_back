const jwt = require('jsonwebtoken')
const Agent = require('../models/agent')

const authenticateAgent = async (req, res ,next) =>{
    const token = req.header('Authorization')?.replace('Bearer', '').trim();
    if(!token){
        return res.status(401).json({error: 'Access denied.'})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const agent = await Agent.findOne({ where: {id: decoded.agentId}});

        if(!agent){
            return res.status(403).json({error: 'Access Denied. Invalid Agent'});
        }

        req.agent = agent;
        next();

    } catch(err){
        res.status(401).json({error: 'Invalid Token.',err});
    }
    
};

module.exports = {
    authenticateAgent,
};