import express from "express";
import { Donation } from "../models/Donation.js";
import { Notification } from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get("/", protect, async (req: any, res) => {
  try {
    const filter: any = {};
    if (req.user.role === 'donor') {
      filter.donor = req.user._id;
    }
    const donations = await Donation.find(filter).populate("donor", "name email").populate("fridge", "name location");
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/", protect, upload.single('image'), async (req: any, res) => {
  try {
    // Check if it's multipart (has body.itemName) or JSON (has body.items)
    let items;
    let quantity;
    const fridge = req.body.fridge;

    if (req.body.items) {
       // JSON payload
       items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
       quantity = req.body.quantity;
    } else {
       // Multipart payload
       const item = {
          itemName: req.body.itemName,
          category: req.body.category,
          quantity: Number(req.body.quantity),
          unit: req.body.unit || 'kg',
          expiryDate: req.body.expiryDate,
          imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
       };
       items = [item];
       quantity = item.quantity;
    }

    const donation = new Donation({
      donor: req.user._id,
      fridge,
      items,
      quantity
    });
    const createdDonation = await donation.save();
    
    res.status(201).json(createdDonation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.put("/:id", protect, async (req: any, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (donation) {
      if (req.user.role !== 'admin' && req.user.role !== 'volunteer') {
        return res.status(403).json({ message: "Not authorized" });
      }
      donation.status = req.body.status || donation.status;
      const updatedDonation = await donation.save();
      
      // Notify donor
      await Notification.create({
        user: donation.donor,
        title: "Donation Update",
        message: `Your donation status is now: ${donation.status}`
      });

      res.json(updatedDonation);
    } else {
      res.status(404).json({ message: "Donation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
