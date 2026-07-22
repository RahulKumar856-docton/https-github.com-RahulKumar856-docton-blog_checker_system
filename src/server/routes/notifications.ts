import express from "express";
import { Notification } from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req: any, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.put("/:id/read", protect, async (req: any, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (notification) {
      notification.isRead = true;
      await notification.save();
      res.json(notification);
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
