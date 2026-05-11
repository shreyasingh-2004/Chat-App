import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import Group from '../models/group.model.js';

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log(`📤 sendMessage: sender=${senderId}, receiver=${receiverId}`);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      console.log('Creating new conversation');
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    console.log(`✅ Message saved: ${newMessage._id}`);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    console.log(`📥 getMessages: between ${senderId} and ${userToChatId}`);

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      console.log('No conversation found, returning empty array');
      return res.status(200).json([]);
    }

    console.log(`✅ Found ${conversation.messages.length} messages`);
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    console.log(`📥 getGroupMessages: group=${groupId}, user=${userId}`);

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const member = group.members.find(m => m.userId.toString() === userId.toString());
    
    let messages;
    if (!member) {
      messages = await Message.find({ groupId })
        .populate('senderId', 'fullName username profilePic')
        .sort({ createdAt: 1 });
      console.log(`Removed user: showing ${messages.length} messages`);
    } else {
      messages = await Message.find({
        groupId,
        createdAt: { $gte: member.joinedAt }
      })
        .populate('senderId', 'fullName username profilePic')
        .sort({ createdAt: 1 });
      console.log(`Member joined at ${member.joinedAt}: showing ${messages.length} messages`);
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Error in getGroupMessages:', error);
    res.status(500).json({ error: error.message });
  }
};