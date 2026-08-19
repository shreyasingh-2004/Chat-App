import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    message: {
      type: String,
      default: ''
    },
    // ✅ FIXED: fileName (was "name") now matches what frontend sends
    attachment: {
      url:      { type: String },
      type:     { type: String },   // "image" | "file" | "voice"
      fileName: { type: String },   // ✅ was "name" — frontend sends "fileName"
      size:     { type: Number },
      mimeType: { type: String },
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen', 'sending'],
      default: 'sent'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    },
    systemMessageType: {
      type: String,
      enum: [
        'member_added', 'member_removed', 'member_left',
        'admin_promoted', 'admin_demoted', 'group_updated'
      ]
    },
    affectedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;