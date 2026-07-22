import mongoose from "mongoose";

const fridgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number, required: true }, // in kg or items
  description: { type: String },
}, { timestamps: true });

export const Fridge = mongoose.model("Fridge", fridgeSchema);
