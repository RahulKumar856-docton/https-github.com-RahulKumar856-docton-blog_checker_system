import express from "express";
import { User } from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.put("/:id", protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
         return res.status(403).json({ message: "Not authorized" });
      }
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.user.role === 'admin' && req.body.role) {
         user.role = req.body.role;
      }
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
