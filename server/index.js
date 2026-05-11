const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    },
    transports: ['websocket', 'polling']
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// Socket.IO authentication
const onlineUsers = new Map(); // userId -> socketId

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication error'));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        socket.userId = decoded.id;
        console.log('✅ Socket authenticated for user:', socket.userId);
        next();
    } catch (err) {
        console.error('❌ Socket auth error:', err.message);
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('🔌 New connection:', socket.id, 'User:', socket.userId);
    
    if (socket.userId) {
        // Store user connection
        onlineUsers.set(socket.userId.toString(), socket.id);
        
        // Update user status in database
        const User = require('./models/User');
        User.findByIdAndUpdate(socket.userId, { 
            isOnline: true, 
            lastSeen: new Date() 
        }).then(() => {
            // Broadcast to all users that this user is online
            io.emit('user-status-change', { 
                userId: socket.userId, 
                isOnline: true 
            });
            console.log(`✅ User ${socket.userId} is online`);
        }).catch(err => console.error('Error updating status:', err));
    }
    
    // Handle sending messages
    socket.on('send-message', async (data) => {
        console.log('📨 Received send-message event:', data);
        console.log('From:', socket.userId, 'To:', data.recipientId);
        
        const Message = require('./models/Message');
        
        try {
            // Save message to database
            const message = new Message({
                sender: socket.userId,
                receiver: data.recipientId,
                content: data.content,
                type: data.type || 'text',
                delivered: false,
                read: false
            });
            
            const savedMessage = await message.save();
            await savedMessage.populate('sender', 'name email profilePic');
            
            console.log('✅ Message saved to database:', savedMessage._id);
            
            // Check if recipient is online
            const recipientSocketId = onlineUsers.get(data.recipientId.toString());
            
            if (recipientSocketId) {
                // Send to recipient
                io.to(recipientSocketId).emit('receive-message', {
                    _id: savedMessage._id,
                    content: data.content,
                    sender: savedMessage.sender,
                    recipientId: data.recipientId,
                    type: data.type || 'text',
                    createdAt: savedMessage.createdAt,
                    delivered: true
                });
                
                // Update message as delivered
                await Message.findByIdAndUpdate(savedMessage._id, {
                    delivered: true,
                    deliveredAt: new Date()
                });
                
                console.log('✅ Message delivered to online user');
                
                // Send delivery confirmation to sender
                socket.emit('message-delivered', {
                    messageId: savedMessage._id,
                    delivered: true,
                    deliveredAt: new Date()
                });
            } else {
                console.log('📱 User is offline, message saved for later');
                socket.emit('message-sent', {
                    messageId: savedMessage._id,
                    status: 'sent'
                });
            }
            
            // Send back to sender with message ID
            socket.emit('message-sent', {
                _id: savedMessage._id,
                ...data,
                createdAt: savedMessage.createdAt,
                status: recipientSocketId ? 'delivered' : 'sent'
            });
            
        } catch (error) {
            console.error('❌ Error saving message:', error);
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });
    
    // Handle typing indicators
    socket.on('typing-start', (data) => {
        const recipientSocketId = onlineUsers.get(data.recipientId.toString());
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('user-typing', {
                userId: socket.userId,
                isTyping: true
            });
        }
    });
    
    socket.on('typing-stop', (data) => {
        const recipientSocketId = onlineUsers.get(data.recipientId.toString());
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('user-typing', {
                userId: socket.userId,
                isTyping: false
            });
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
        console.log('🔌 Socket disconnected:', socket.id);
        
        if (socket.userId) {
            onlineUsers.delete(socket.userId.toString());
            
            const User = require('./models/User');
            await User.findByIdAndUpdate(socket.userId, { 
                isOnline: false, 
                lastSeen: new Date() 
            });
            
            io.emit('user-status-change', { 
                userId: socket.userId, 
                isOnline: false 
            });
            console.log(`🔴 User ${socket.userId} is offline`);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});