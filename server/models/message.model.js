import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    message: {
      type: String,
      default: ''
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    },
    systemMessageType: {
      type: String,
      enum: ['member_added', 'member_removed', 'member_left', 'admin_promoted', 'admin_demoted', 'group_created', 'group_updated', 'group_deleted'],
      default: null
    },
    affectedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readAt: Date,
    deliveredAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

messageSchema.index({ groupId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;