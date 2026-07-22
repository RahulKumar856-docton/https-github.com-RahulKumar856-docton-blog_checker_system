import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['active', 'collected', 'cancelled'], default: 'active' },
}, { timestamps: true });

export const Reservation = mongoose.model("Reservation", reservationSchema);
