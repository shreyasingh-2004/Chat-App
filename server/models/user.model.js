import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 120,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    groups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    }],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add index
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema);
export default User;
