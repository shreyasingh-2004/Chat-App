import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  sendMessage,
  getMessages,
  getGroupMessages,
  editMessage,
  getUnreadCount,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);
router.get("/group/:groupId",protectRoute, getGroupMessages);
router.get("/unread/count",protectRoute, getUnreadCount);
router.get("/:id",protectRoute, getMessages);
router.put("/edit",protectRoute, editMessage);

export default router;