import express from "express";
import { Inventory } from "../models/Inventory.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.fridge) filter.fridge = req.query.fridge;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const inventory = await Inventory.find(filter).populate("fridge", "name location").populate("uploadedBy", "name email");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/", protect, upload.single("image"), async (req: any, res) => {
  try {
    const { fridge, itemName, category, quantity, unit, expiryDate } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    const item = new Inventory({
      fridge, itemName, category, quantity, unit, expiryDate, uploadedBy: req.user._id, image
    });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.put("/:id", protect, async (req: any, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (item) {
      // Basic auth check: admin or volunteer
      if (req.user.role !== 'admin' && req.user.role !== 'volunteer') {
        return res.status(403).json({ message: "Not authorized" });
      }
      Object.assign(item, req.body);
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.delete("/:id", protect, async (req: any, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (item) {
       if (req.user.role !== 'admin' && req.user.role !== 'volunteer') {
        return res.status(403).json({ message: "Not authorized" });
      }
      await item.deleteOne();
      res.json({ message: "Item removed" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
