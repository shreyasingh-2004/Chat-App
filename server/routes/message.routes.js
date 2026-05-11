import express from 'express';
import { sendMessage, getMessages, getGroupMessages } from '../controllers/message.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);
router.get('/group/:groupId', protectRoute, getGroupMessages);

export default router;