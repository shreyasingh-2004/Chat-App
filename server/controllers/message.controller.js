import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const messagePopulate = [
  { path: "senderId", select: "fullName username name profilePic" },
  {
    path: "replyTo",
    select: "message senderId",
    populate: {
      path: "senderId",
      select: "fullName username name profilePic",
    },
  },
];

// Visibility check
export const isMessageVisibleTo = (message, userId) => {
  return !message.deletedFor?.some(
    (id) => id.toString() === userId.toString()
  );
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { message, attachment, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!message?.trim() && !attachment?.url) {
      return res.status(400).json({ error: "Message required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message?.trim() || "",
      attachment,
      replyTo,
      status: "sent",
    });

    await newMessage.save();
    conversation.messages.push(newMessage._id);
    await conversation.save();
    await newMessage.populate(messagePopulate);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET MESSAGES (1:1) with pagination
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { limit = 50, skip = 0 } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const parsedSkip  = Math.max(parseInt(skip)  || 0,  0);

    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userId, receiverId: id },
        { senderId: id,     receiverId: userId },
      ],
    });

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: id },
        { senderId: id,     receiverId: userId },
      ],
    })
      .populate(messagePopulate)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(parsedSkip);

    const filteredMessages = messages
      .filter((m) => isMessageVisibleTo(m, userId))
      .reverse();

    res.json({
      messages: filteredMessages,
      pagination: {
        total:   totalMessages,
        limit:   parsedLimit,
        skip:    parsedSkip,
        hasMore: parsedSkip + parsedLimit < totalMessages,
      },
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET GROUP MESSAGES with pagination
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const { limit = 50, skip = 0 } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const parsedSkip  = Math.max(parseInt(skip)  || 0,  0);

    const totalMessages = await Message.countDocuments({ groupId });

    const messages = await Message.find({ groupId })
      .populate(messagePopulate)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(parsedSkip);

    const filteredMessages = messages
      .filter((m) => isMessageVisibleTo(m, userId))
      .reverse();

    res.json({
      messages: filteredMessages,
      pagination: {
        total:   totalMessages,
        limit:   parsedLimit,
        skip:    parsedSkip,
        hasMore: parsedSkip + parsedLimit < totalMessages,
      },
    });
  } catch (error) {
    console.error("getGroupMessages error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//EDIT MESSAGE
export const editMessage = async (req, res) => {
  try {
    const { messageId, newText } = req.body;
    const msg = await Message.findById(messageId);

    if (!msg) return res.status(404).json({ error: "Message not found" });
    if (msg.senderId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Unauthorized" });

    msg.message  = newText;
    msg.isEdited = true;
    await msg.save();
    await msg.populate(messagePopulate);

    res.json({ success: true, data: msg });
  } catch (err) {
    console.error("Error in editMessage:", err);
    res.status(500).json({ error: err.message });
  }
};

//DELETE MESSAGE (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ error: "Message not found" });

    const isSender   = message.senderId.toString()   === userId.toString();
    const isReceiver = message.receiverId?.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ error: "Unauthorized to delete this message" });
    }

    if (isSender) {
      message.isDeleted = true;
      message.message   = "This message was deleted";
      message.attachment = null;
      await message.save();
    } else {
      if (!message.deletedFor) message.deletedFor = [];
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error in deleteMessage:", err);
    res.status(500).json({ error: err.message });
  }
};

// UNREAD COUNT
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const counts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          status:     { $ne: "seen" },
          isDeleted:  { $ne: true },
          deletedFor: { $not: { $in: [userId] } },
        },
      },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);
    const totalUnread = counts.reduce((sum, item) => sum + item.count, 0);
    res.json({ bySender: counts, total: totalUnread });
  } catch (err) {
    console.error("Error in getUnreadCount:", err);
    res.status(500).json({ error: err.message });
  }
};

// MARK MESSAGES AS READ
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user._id;
    const result = await Message.updateMany(
      { senderId, receiverId: userId, status: { $ne: "seen" } },
      { $set: { status: "seen", seenAt: new Date() } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Error in markAsRead:", err);
    res.status(500).json({ error: err.message });
  }
};