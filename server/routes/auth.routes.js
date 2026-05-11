import express from 'express';
import { login, signup, logout } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', protectRoute, (req, res) => {
  res.json({ user: req.user, valid: true });
});

export default router;