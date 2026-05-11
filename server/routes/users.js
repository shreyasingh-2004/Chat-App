const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users except the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching users for:', req.user.id);
    
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${users.length} other users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID with status
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;