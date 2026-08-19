import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  sendMessage,
  getMessages,
  getGroupMessages,
  editMessage,
  getUnreadCount,
  uploadMedia,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);

// ✅ Specific routes BEFORE the wildcard /:id
router.post("/upload-media",       protectRoute, uploadMedia);
router.get("/group/:groupId",      protectRoute, getGroupMessages);
router.get("/unread/count",        protectRoute, getUnreadCount);

// ✅ Wildcard last
router.get("/:id",   protectRoute, getMessages);
router.put("/edit",  protectRoute, editMessage);

export default router;