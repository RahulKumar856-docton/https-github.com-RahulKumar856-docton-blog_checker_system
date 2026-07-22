import express from "express";
import { Reservation } from "../models/Reservation.js";
import { Inventory } from "../models/Inventory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req: any, res) => {
  try {
    const filter: any = {};
    if (req.user.role === 'member') {
      filter.member = req.user._id;
    }
    const reservations = await Reservation.find(filter)
      .populate("member", "name email")
      .populate({
        path: 'inventoryItem',
        populate: { path: 'fridge', select: 'name location' }
      });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/", protect, async (req: any, res) => {
  try {
    const { inventoryItem, quantity } = req.body;
    
    const item = await Inventory.findById(inventoryItem);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.status !== 'available' || item.quantity < quantity) {
      return res.status(400).json({ message: "Item not available or insufficient quantity" });
    }

    item.quantity -= quantity;
    if (item.quantity === 0) item.status = 'reserved';
    await item.save();

    const reservation = new Reservation({
      member: req.user._id,
      inventoryItem,
      quantity
    });
    const createdReservation = await reservation.save();
    
    res.status(201).json(createdReservation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
