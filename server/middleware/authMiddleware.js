const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    
    console.log('Auth header:', req.headers.authorization);
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token received:', token.substring(0, 20) + '...');
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            console.log('Token decoded:', decoded);
            
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                console.log('User not found for token');
                return res.status(401).json({ message: 'User not found' });
            }
            
            console.log('User authenticated:', req.user.email);
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No authorization header found');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };