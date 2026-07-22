import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fridge: { type: mongoose.Schema.Types.ObjectId, ref: 'Fridge', required: true },
  items: [{
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, default: 'kg' },
    expiryDate: { type: Date, required: true },
    imageUrl: { type: String },
  }],
  quantity: { type: Number, required: true }, // Total items/kg
  status: { type: String, enum: ['Pending', 'Accepted', 'Collected', 'Completed'], default: 'Pending' },
  donatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Donation = mongoose.model("Donation", donationSchema);
