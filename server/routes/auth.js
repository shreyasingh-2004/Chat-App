const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// 🔐 Generate JWT helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '30d' }
  );
};

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt:', { 
    name: req.body.name, 
    email: req.body.email 
  });

  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('⚠️ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    console.log('✅ User created:', user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password - FIXED: Properly await the comparison
    const isMatch = await user.comparePassword(password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    console.log('✅ Login successful:', email);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: error.message });
  }
});

// ================= VERIFY TOKEN =================
router.get('/verify', auth, async (req, res) => {
  try {
    console.log('🔍 Verifying token for user:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        valid: false,
        message: 'User not found'
      });
    }

    res.json({
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(401).json({
      valid: false,
      message: 'Token invalid'
    });
  }
});

// ================= LOGOUT =================
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date()
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;