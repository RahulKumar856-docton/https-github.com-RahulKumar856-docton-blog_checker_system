import express from "express";
import { Fridge } from "../models/Fridge.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const fridges = await Fridge.find({});
    res.json(fridges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/", protect, admin, async (req, res) => {
  try {
    const fridge = new Fridge(req.body);
    const createdFridge = await fridge.save();
    res.status(201).json(createdFridge);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const fridge = await Fridge.findById(req.params.id);
    if (fridge) {
      Object.assign(fridge, req.body);
      const updatedFridge = await fridge.save();
      res.json(updatedFridge);
    } else {
      res.status(404).json({ message: "Fridge not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const fridge = await Fridge.findById(req.params.id);
    if (fridge) {
      await fridge.deleteOne();
      res.json({ message: "Fridge removed" });
    } else {
      res.status(404).json({ message: "Fridge not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
