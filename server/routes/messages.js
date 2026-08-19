const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;
    
    console.log(`📋 Fetching messages between ${currentUserId} and ${userId}`);
    
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email profilePic')
    .populate('receiver', 'name email profilePic');
    
    console.log(`✅ Found ${messages.length} messages`);
    
    // Mark unread messages as delivered
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        delivered: false
      },
      {
        delivered: true,
        deliveredAt: new Date()
      }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send message (HTTP fallback)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, type } = req.body;
    
    console.log(`📨 HTTP send message from ${req.user.id} to ${receiverId}`);
    
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content: content,
      type: type || 'text',
      delivered: false,
      read: false
    });
    
    await message.save();
    await message.populate('sender', 'name email profilePic');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;