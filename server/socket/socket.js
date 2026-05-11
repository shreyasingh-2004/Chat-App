import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import Group from '../models/group.model.js';
import User from '../models/user.model.js';

const onlineUsers = new Map();
const socketToUser = new Map();

export const getOnlineUsersMap = () => onlineUsers;

export const setupSocket = (server, allowedOrigins) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    console.log(`✅ CONNECTED: ${user.fullName}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

    // Auto join groups
    try {
      const groups = await Group.find({ 'members.userId': userId });
      for (const group of groups) {
        socket.join(`group_${group._id}`);
        console.log(`📢 Joined group: ${group.name} (${group._id})`);
      }
    } catch (error) {
      console.error('Error joining groups:', error);
    }

    // Personal message
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { receiverId, message } = data;
        
        console.log(`💬 Personal message from ${user.fullName} to ${receiverId}`);

        const newMessage = new Message({
          senderId: userId,
          receiverId,
          message: message.trim(),
          status: 'sent'
        });

        const savedMessage = await newMessage.save();
        
        let conversation = await Conversation.findOne({
          participants: { $all: [userId, receiverId] }
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [userId, receiverId],
            messages: [savedMessage._id]
          });
        } else {
          conversation.messages.push(savedMessage._id);
        }
        await conversation.save();

        // Send to receiver if online
        const receiverSockets = onlineUsers.get(receiverId);
        if (receiverSockets && receiverSockets.size > 0) {
          receiverSockets.forEach(socketId => {
            io.to(socketId).emit('newMessage', savedMessage);
          });
        }

        // Send back to sender as confirmation
        if (callback) {
          callback({ success: true, message: savedMessage });
        }
        
      } catch (error) {
        console.error('Personal message error:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // GROUP MESSAGE - Don't send back to sender
    socket.on('sendGroupMessage', async (data, callback) => {
      try {
        const { groupId, message, tempId } = data;
        
        console.log(`👥 GROUP message from ${user.fullName} in group ${groupId}: ${message}`);
        
        if (!message?.trim()) {
          return callback({ success: false, error: 'Message required' });
        }
        
        const group = await Group.findById(groupId);
        if (!group) {
          return callback({ success: false, error: 'Group not found' });
        }
        
        const member = group.members.find(m => m.userId.toString() === userId);
        if (!member) {
          return callback({ success: false, error: 'You are no longer a member of this group' });
        }
        
        const newMessage = new Message({
          senderId: userId,
          groupId: groupId,
          message: message.trim(),
          status: 'sent',
          createdAt: new Date()
        });
        
        const savedMessage = await newMessage.save();
        await savedMessage.populate('senderId', 'fullName username profilePic');
        
        console.log(`✅ Group message saved: ${savedMessage._id} for group ${groupId}`);
        
        // Send to ALL OTHER group members EXCEPT the sender
        socket.to(`group_${groupId}`).emit('newGroupMessage', savedMessage);
        
        // Send confirmation back to sender only
        if (callback) {
          callback({ success: true, message: savedMessage, tempId });
        }
        
      } catch (error) {
        console.error('Group message error:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('disconnect', () => {
      const disconnectedUserId = socketToUser.get(socket.id);
      if (disconnectedUserId) {
        const userSockets = onlineUsers.get(disconnectedUserId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(disconnectedUserId);
            io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
          }
        }
        socketToUser.delete(socket.id);
      }
      console.log(`❌ DISCONNECTED: ${user?.fullName || 'Unknown'}`);
    });
  });

  return io;
};