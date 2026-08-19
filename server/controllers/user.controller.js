import User from '../models/user.model.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get all users except the logged in user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("fullName username profilePic bio gender")
      .sort({ fullName: 1 })
      .lean();
    
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const { fullName, bio, profilePic } = req.body;

    if (typeof fullName === 'string' && fullName.trim()) {
      updates.fullName = fullName.trim();
    }

    if (typeof bio === 'string') {
      updates.bio = bio.trim().slice(0, 160);
    }

    if (typeof profilePic === 'string') {
      updates.profilePic = profilePic;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    req.app.get('io')?.emit('userUpdated', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
};
