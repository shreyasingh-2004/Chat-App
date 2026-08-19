const router = require('express').Router();
const Chat = require('../models/Chat');
const User = require('../models/User');

// Create or get one-to-one chat
router.post('/', async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;

        // Check if chat already exists
        let chat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [userId, otherUserId] }
        }).populate('users', '-password');

        if (chat) {
            return res.json(chat);
        }

        // Create new chat
        chat = await Chat.create({
            chatName: 'sender',
            isGroupChat: false,
            users: [userId, otherUserId]
        });

        chat = await Chat.findById(chat._id).populate('users', '-password');
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all chats for a user
router.get('/:userId', async (req, res) => {
    try {
        const chats = await Chat.find({
            users: { $elemMatch: { $eq: req.params.userId } }
        })
            .populate('users', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create group chat
router.post('/group', async (req, res) => {
    try {
        const { users, groupName, admin } = req.body;

        const groupChat = await Chat.create({
            chatName: groupName,
            isGroupChat: true,
            users: users,
            groupAdmin: admin
        });

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.json(fullGroupChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add user to group
router.put('/group/add', async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const updated = await Chat.findByIdAndUpdate(
            chatId,
            { $addToSet: { users: userId } },
            { new: true }
        ).populate('users', '-password');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;