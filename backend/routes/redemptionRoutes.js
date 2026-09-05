import express from 'express';
import Redemption from '../models/Redemption.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/redemptions/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.user._id }).sort({ date: -1 });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch redemption history', error: err.message });
  }
});

export default router;
