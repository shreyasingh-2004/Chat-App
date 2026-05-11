import express from 'express';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  getGroupMembers,
  addMembers,
  removeMember,
  makeAdmin,
  removeAdmin,
  updateGroupName,
  leaveGroup,
  deleteGroup,
  debugGroup,
  debugGroupMessages
} from '../controllers/group.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/create', protectRoute, createGroup);
router.get('/my-groups', protectRoute, getMyGroups);
router.get('/:groupId', protectRoute, getGroupById);
router.get('/:groupId/members', protectRoute, getGroupMembers);
router.get('/:groupId/debug', protectRoute, debugGroup);
router.get('/:groupId/debug-messages', protectRoute, debugGroupMessages);
router.post('/:groupId/add-members', protectRoute, addMembers);
router.delete('/:groupId/remove/:userId', protectRoute, removeMember);
router.put('/:groupId/make-admin/:userId', protectRoute, makeAdmin);
router.put('/:groupId/remove-admin/:userId', protectRoute, removeAdmin);
router.put('/:groupId/update-name', protectRoute, updateGroupName);
router.post('/:groupId/leave', protectRoute, leaveGroup);
router.delete('/:groupId/delete', protectRoute, deleteGroup);

export default router;