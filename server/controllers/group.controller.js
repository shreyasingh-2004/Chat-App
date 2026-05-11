import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import { getOnlineUsersMap } from '../socket/socket.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const creatorId = req.user._id;

    const members = [
      { userId: creatorId, role: 'admin', joinedAt: new Date() },
      ...memberIds.map(id => ({ userId: id, role: 'member', joinedAt: new Date() }))
    ];

    const newGroup = new Group({
      name,
      description,
      creator: creatorId,
      members
    });

    await newGroup.save();

    const allMemberIds = [creatorId, ...memberIds];
    await User.updateMany(
      { _id: { $in: allMemberIds } },
      { $addToSet: { groups: newGroup._id } }
    );

    const populatedGroup = await Group.findById(newGroup._id)
      .populate('members.userId', 'fullName username profilePic')
      .populate('creator', 'fullName username');

    const io = req.app.get('io');
    if (io) {
      io.emit("groupCreated", populatedGroup);
    }

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.userId': req.user._id
    })
      .populate('members.userId', 'fullName username profilePic')
      .populate('creator', 'fullName username')
      .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.userId', 'fullName username profilePic')
      .populate('creator', 'fullName username');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      m => m.userId._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.userId', 'fullName username profilePic');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      m => m.userId._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member' });
    }

    const members = group.members.map(m => ({
      _id: m.userId._id,
      fullName: m.userId.fullName,
      username: m.userId.username,
      profilePic: m.userId.profilePic,
      role: m.role,
      joinedAt: m.joinedAt
    }));

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const { groupId } = req.params;
    const currentUser = req.user;
    
    console.log(`➕ Adding members to group ${groupId}`);
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isAdmin = group.members.some(
      m => m.userId.toString() === currentUser._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const addedUsers = [];
    const systemMessages = [];
    
    for (const userId of userIds) {
      if (!group.members.some(m => m.userId.toString() === userId.toString())) {
        const newUser = await User.findById(userId);
        const joinedAt = new Date();
        
        group.members.push({ 
          userId, 
          role: 'member', 
          joinedAt 
        });
        
        await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });
        addedUsers.push(userId);
        
        const systemMessage = new Message({
          groupId: group._id,
          isSystemMessage: true,
          systemMessageType: 'member_added',
          senderId: currentUser._id,
          affectedUser: userId,
          message: `${currentUser.fullName} added ${newUser.fullName}`,
          status: 'sent'
        });
        await systemMessage.save();
        await systemMessage.populate('senderId', 'fullName');
        systemMessages.push(systemMessage);
        
        console.log(`✅ Added ${newUser.fullName} at ${joinedAt}`);
      }
    }

    await group.save();
    await group.populate('members.userId', 'fullName username profilePic');

    const io = req.app.get('io');
    if (io) {
      // Emit member list updated event to all group members
      io.to(`group_${groupId}`).emit('memberListUpdated', { 
        groupId: group._id, 
        action: 'members_added',
        userIds: addedUsers
      });
      
      // Emit each system message to all group members in real-time
      for (const msg of systemMessages) {
        io.to(`group_${groupId}`).emit('newGroupMessage', msg);
      }
    }

    res.json(group);
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ error: error.message || 'Failed to add members' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const currentUser = req.user;
    
    console.log(`🗑️ Removing member ${userId} from group ${groupId}`);
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const removedUser = await User.findById(userId);
    if (!removedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isAdmin = group.members.some(
      m => m.userId.toString() === currentUser._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    if (group.creator.toString() === userId.toString()) {
      return res.status(403).json({ error: 'Cannot remove group creator' });
    }

    group.members = group.members.filter(m => m.userId.toString() !== userId.toString());
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

    const systemMessage = new Message({
      groupId: group._id,
      isSystemMessage: true,
      systemMessageType: 'member_removed',
      senderId: currentUser._id,
      affectedUser: userId,
      message: `${currentUser.fullName} removed ${removedUser.fullName}`,
      status: 'sent'
    });
    await systemMessage.save();
    await systemMessage.populate('senderId', 'fullName');

    const io = req.app.get('io');
    if (io) {
      // Emit member list updated event to all group members
      io.to(`group_${groupId}`).emit('memberListUpdated', { 
        groupId, 
        action: 'member_removed',
        userId: userId
      });
      
      // Emit system message to all group members in real-time
      io.to(`group_${groupId}`).emit('newGroupMessage', systemMessage);
      
      // Notify the removed user
      const userSockets = getOnlineUsersMap();
      const removedUserSockets = userSockets.get(userId.toString());
      if (removedUserSockets) {
        removedUserSockets.forEach(socketId => {
          io.to(socketId).emit('removedFromGroup', { groupId, groupName: group.name });
        });
      }
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: error.message || 'Failed to remove member' });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const currentUser = req.user;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isAdmin = group.members.some(
      m => m.userId.toString() === currentUser._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can make other admins' });
    }

    const memberIndex = group.members.findIndex(m => m.userId.toString() === userId.toString());
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'User not in group' });
    }

    if (group.creator.toString() === userId.toString()) {
      return res.status(403).json({ error: 'Creator is already an admin' });
    }

    const promotedUser = await User.findById(userId);
    group.members[memberIndex].role = 'admin';
    await group.save();

    const systemMessage = new Message({
      groupId: group._id,
      isSystemMessage: true,
      systemMessageType: 'admin_promoted',
      senderId: currentUser._id,
      affectedUser: userId,
      message: `${currentUser.fullName} made ${promotedUser.fullName} an admin`,
      status: 'sent'
    });
    await systemMessage.save();
    await systemMessage.populate('senderId', 'fullName');

    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('adminChanged', { groupId, userId, role: 'admin' });
      io.to(`group_${groupId}`).emit('newGroupMessage', systemMessage);
    }

    res.json({ message: 'User is now an admin' });
  } catch (error) {
    console.error('Error making admin:', error);
    res.status(500).json({ error: error.message || 'Failed to make admin' });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const currentUser = req.user;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isAdmin = group.members.some(
      m => m.userId.toString() === currentUser._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can remove admin status' });
    }

    if (group.creator.toString() === userId.toString()) {
      return res.status(403).json({ error: 'Cannot remove admin status from group creator' });
    }

    const memberIndex = group.members.findIndex(m => m.userId.toString() === userId.toString());
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'User not in group' });
    }

    const demotedUser = await User.findById(userId);
    group.members[memberIndex].role = 'member';
    await group.save();

    const systemMessage = new Message({
      groupId: group._id,
      isSystemMessage: true,
      systemMessageType: 'admin_demoted',
      senderId: currentUser._id,
      affectedUser: userId,
      message: `${currentUser.fullName} removed ${demotedUser.fullName} as admin`,
      status: 'sent'
    });
    await systemMessage.save();
    await systemMessage.populate('senderId', 'fullName');

    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('adminChanged', { groupId, userId, role: 'member' });
      io.to(`group_${groupId}`).emit('newGroupMessage', systemMessage);
    }

    res.json({ message: 'Admin status removed' });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ error: error.message || 'Failed to remove admin' });
  }
};

export const updateGroupName = async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isAdmin = group.members.some(
      m => m.userId.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can change group name' });
    }

    group.name = name;
    group.updatedAt = Date.now();
    await group.save();

    const systemMessage = new Message({
      groupId: group._id,
      isSystemMessage: true,
      systemMessageType: 'group_updated',
      message: `${req.user.fullName} changed group name to "${name}"`,
      status: 'sent'
    });
    await systemMessage.save();
    await systemMessage.populate('senderId', 'fullName');

    const io = req.app.get('io');
    if (io) {
      io.to(`group_${group._id}`).emit('groupUpdated', { groupId: group._id, name });
      io.to(`group_${group._id}`).emit('newGroupMessage', systemMessage);
    }

    res.json(group);
  } catch (error) {
    console.error('Error updating group name:', error);
    res.status(500).json({ error: 'Failed to update group name' });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const currentUser = req.user;

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(m => m.userId.toString() === currentUser._id.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const systemMessage = new Message({
      groupId: group._id,
      isSystemMessage: true,
      systemMessageType: 'member_left',
      senderId: currentUser._id,
      affectedUser: currentUser._id,
      message: `${currentUser.fullName} left the group`,
      status: 'sent'
    });
    await systemMessage.save();
    await systemMessage.populate('senderId', 'fullName');

    group.members = group.members.filter(m => m.userId.toString() !== currentUser._id.toString());
    
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(req.params.groupId);
    } else {
      await group.save();
    }

    await User.findByIdAndUpdate(currentUser._id, { $pull: { groups: req.params.groupId } });

    const io = req.app.get('io');
    if (io) {
      io.to(`group_${group._id}`).emit('memberRemoved', { 
        groupId: req.params.groupId, 
        userId: currentUser._id,
        userName: currentUser.fullName,
        removedBy: currentUser.fullName
      });
      io.to(`group_${group._id}`).emit('newGroupMessage', systemMessage);
    }

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const currentUser = req.user;

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creator.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Only group creator can delete the group' });
    }

    await User.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    await Message.deleteMany({ groupId: group._id });
    await Group.findByIdAndDelete(req.params.groupId);

    const io = req.app.get('io');
    if (io) {
      io.to(`group_${group._id}`).emit('groupDeleted', { groupId: group._id });
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

export const debugGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    console.log("🔍 Debugging group:", groupId);
    
    const group = await Group.findById(groupId)
      .populate('members.userId', 'fullName username email');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const debugInfo = {
      groupId: group._id,
      name: group.name,
      creator: group.creator,
      membersCount: group.members.length,
      members: group.members.map(m => ({
        userId: m.userId?._id,
        userName: m.userId?.fullName,
        userUsername: m.userId?.username,
        role: m.role,
        joinedAt: m.joinedAt,
        hasUserId: !!m.userId
      }))
    };
    
    console.log("Debug info:", JSON.stringify(debugInfo, null, 2));
    res.json(debugInfo);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const debugGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await Group.findById(groupId).populate('members.userId', 'fullName username');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const member = group.members.find(m => m.userId._id.toString() === userId.toString());
    
    const allMessages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .select('createdAt message senderId');
    
    const joinedAt = member ? member.joinedAt : null;
    const messagesAfterJoin = joinedAt ? await Message.find({
      groupId,
      createdAt: { $gte: new Date(joinedAt) }
    }) : [];
    
    res.json({
      groupName: group.name,
      userJoinedAt: joinedAt,
      userJoinedAtFormatted: joinedAt ? new Date(joinedAt).toLocaleString() : 'Not a member',
      totalMessages: allMessages.length,
      messagesAfterJoin: messagesAfterJoin.length,
      messagesBeforeJoin: allMessages.length - messagesAfterJoin.length,
      firstMessageDate: allMessages[0]?.createdAt,
      lastMessageDate: allMessages[allMessages.length-1]?.createdAt,
      allMessages: allMessages.map(m => ({
        id: m._id,
        date: m.createdAt,
        formattedDate: new Date(m.createdAt).toLocaleString(),
        message: m.message?.substring(0, 50)
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};