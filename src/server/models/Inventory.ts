import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  fridge: { type: mongoose.Schema.Types.ObjectId, ref: 'Fridge', required: true },
  itemName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Bakery', 'Cooked Food', 'Drinks', 'Others'],
    required: true
  },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'items' },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['available', 'reserved', 'expired', 'collected'], default: 'available' },
  image: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Inventory = mongoose.model("Inventory", inventorySchema);
