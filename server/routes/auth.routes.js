import express from 'express';
import { login, signup, logout } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Verify endpoint - returns user data if token is valid
router.get('/verify', protectRoute, (req, res) => {
  res.status(200).json({ 
    user: req.user, 
    valid: true,
    message: 'Token is valid'
  });
});

export default router;