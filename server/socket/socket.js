import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import Group from '../models/group.model.js';
import User from '../models/user.model.js';

const onlineUsers = new Map();
const socketToUser = new Map();
const markAsSeenDebounce = new Map();

const messagePopulate = [
  { path: 'senderId', select: 'fullName username name profilePic' },
  {
    path: 'replyTo',
    select: 'message attachment senderId isDeleted',
    populate: { path: 'senderId', select: 'fullName username name profilePic' }
  }
];

// helper to export online users map
export const getOnlineUsersMap = () => onlineUsers;

// helper to get receiver socket
const getReceiverSocketIds = (userId) => {
  return onlineUsers.get(userId) || new Set();
};

export const setupSocket = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
  });

  // =============================
  // AUTH
  // =============================
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token;

      if (!token) return next(new Error('No token provided'));

      if (token.startsWith('Bearer ')) {
        token = token.slice(7);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Auth failed: ' + error.message));
    }
  });

  // =============================
  // CONNECTION
  // =============================
  io.on('connection', async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    console.log(`✅ CONNECTED: ${user.fullName}`);

    // store online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);

    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

    // =============================
    // JOIN GROUPS
    // =============================
    try {
      const groups = await Group.find({ 'members.userId': userId });
      for (const group of groups) {
        socket.join(`group_${group._id}`);
        console.log(`✅ ${user.fullName} joined room group_${group._id}`);
      }
    } catch (error) {
      console.error('Error joining groups:', error);
    }

    // =============================
    // JOIN GROUP ROOM (when a new member is added mid-session)
    // =============================
    socket.on('joinGroupRoom', async ({ groupId }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return;
        
        const isMember = group.members.some(m => m.userId.toString() === userId);
        if (isMember) {
          socket.join(`group_${groupId}`);
          console.log(`✅ ${user.fullName} joined room group_${groupId}`);
          
          // Optionally send recent messages to the new member
          const recentMessages = await Message.find({ groupId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate(messagePopulate)
            .sort({ createdAt: 1 });
          
          socket.emit('groupMessages', { groupId, messages: recentMessages });
        }
      } catch (err) {
        console.error('joinGroupRoom error:', err);
      }
    });

    // =============================
    // PERSONAL MESSAGE
    // =============================
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { receiverId, message, attachment, replyTo } = data;

        if (!message?.trim() && !attachment?.url) {
          return callback?.({ success: false });
        }

        const newMessage = new Message({
          senderId: userId,
          receiverId,
          message: message?.trim() || '',
          attachment,
          replyTo,
          status: 'sent'
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate(messagePopulate);

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

        // =============================
        // SEND TO RECEIVER
        // =============================
        const receiverSockets = getReceiverSocketIds(receiverId);

        if (receiverSockets.size > 0) {
          receiverSockets.forEach((socketId) => {
            io.to(socketId).emit('newMessage', savedMessage);
          });

          // mark delivered
          savedMessage.status = 'delivered';
          await savedMessage.save();
        }

        callback?.({ success: true, message: savedMessage });

      } catch (error) {
        console.error('❌ sendMessage error:', error);
        callback?.({ success: false, error: error.message });
      }
    });

    // =============================
    // MARK AS SEEN - WITH DEBOUNCE
    // =============================
    socket.on("markAsSeen", async ({ chatUserId }) => {
      try {
        // Clear existing timeout for this user pair
        const debounceKey = `${socket.user._id}-${chatUserId}`;
        if (markAsSeenDebounce.has(debounceKey)) {
          clearTimeout(markAsSeenDebounce.get(debounceKey));
        }

        // Set new timeout
        const timeoutId = setTimeout(async () => {
          try {
            await Message.updateMany(
              {
                senderId: chatUserId,
                receiverId: socket.user._id,
                status: { $ne: "seen" },
              },
              { status: "seen" }
            );

            const senderSockets = onlineUsers.get(chatUserId);

            if (senderSockets) {
              senderSockets.forEach((id) => {
                io.to(id).emit("messagesSeen", {
                  by: socket.user._id,
                });
              });
            }

            markAsSeenDebounce.delete(debounceKey);
          } catch (err) {
            console.error('❌ markAsSeen timeout error:', err);
          }
        }, 500); // Wait 500ms before executing

        markAsSeenDebounce.set(debounceKey, timeoutId);
      } catch (error) {
        console.error('❌ markAsSeen error:', error);
      }
    });

    // =============================
    // GROUP MESSAGE
    // =============================
    socket.on('sendGroupMessage', async (data, callback) => {
      try {
        const { groupId, message, attachment, replyTo, tempId } = data;

        if (!message?.trim() && !attachment?.url) {
          return callback({ success: false });
        }

        const group = await Group.findById(groupId);
        if (!group) return callback({ success: false });

        const member = group.members.find(m => m.userId.toString() === userId);
        if (!member) return callback({ success: false });

        const newMessage = new Message({
          senderId: userId,
          groupId,
          message: message?.trim() || '',
          attachment,
          replyTo,
          status: 'sent'
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate(messagePopulate);

        io.to(`group_${groupId}`).emit('newGroupMessage', savedMessage);

        callback?.({ success: true, message: savedMessage, tempId });

      } catch (error) {
        console.error('❌ sendGroupMessage error:', error);
        callback?.({ success: false, error: error.message });
      }
    });

    // =============================
    // EDIT MESSAGE
    // =============================
    socket.on('editMessage', async ({ messageId, message }, callback) => {
      try {
        const updated = await Message.findOneAndUpdate(
          { _id: messageId, senderId: userId, isDeleted: false },
          { message: message?.trim() || '', editedAt: new Date() },
          { new: true }
        ).populate(messagePopulate);

        if (!updated) return callback?.({ success: false });

        if (updated.groupId) {
          io.to(`group_${updated.groupId}`).emit('messageEdited', updated);
        } else {
          const receiverSockets = getReceiverSocketIds(updated.receiverId?.toString());
          receiverSockets.forEach((id) => io.to(id).emit('messageEdited', updated));
          socket.emit('messageEdited', updated);
        }

        callback?.({ success: true, message: updated });

      } catch (error) {
        console.error('❌ editMessage error:', error);
        callback?.({ success: false, error: error.message });
      }
    });

    // =============================
    // DELETE MESSAGE
    // =============================
    socket.on('deleteMessage', async ({ messageId, mode }, callback) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return callback?.({ success: false });

        if (mode === 'everyone') {
          if (message.senderId.toString() !== userId) {
            return callback?.({ success: false });
          }
          message.isDeleted = true;
          message.message   = '';
        } else {
          message.deletedFor.addToSet(userId);
        }

        await message.save();
        await message.populate(messagePopulate);

        // Include messageId, mode, and userId so the client listener
        // can correctly handle "delete for me" vs "delete for everyone"
        const deletePayload = {
          messageId: message._id.toString(),
          mode,
          userId,
          message,
        };

        if (message.groupId) {
          io.to(`group_${message.groupId}`).emit('messageDeleted', deletePayload);
        } else {
          const receiverSockets = getReceiverSocketIds(message.receiverId?.toString());
          receiverSockets.forEach((id) => io.to(id).emit('messageDeleted', deletePayload));
          socket.emit('messageDeleted', deletePayload);
        }

        callback?.({ success: true });
      } catch (error) {
        console.error('❌ deleteMessage error:', error);
        callback?.({ success: false, error: error.message });
      }
    });

    // =============================
    // DISCONNECT
    // =============================
    socket.on("disconnect", async () => {
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          lastSeen: new Date(),
        });

        const userId = socketToUser.get(socket.id);

        if (userId) {
          const sockets = onlineUsers.get(userId);
          if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              onlineUsers.delete(userId);
            }
          }
        }

        socketToUser.delete(socket.id);
        
        // Emit updated online users
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        
        console.log(`❌ DISCONNECTED: ${socket.user.fullName}`);
      } catch (error) {
        console.error('❌ disconnect error:', error);
      }
    });
  });

  return io;
};