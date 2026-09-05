import express from 'express';
import Reward from '../models/Reward.js';
import Redemption from '../models/Redemption.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/rewards  (public list, so it can be shown before login too if needed)
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ cost: 1 });
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rewards', error: err.message });
  }
});

// POST /api/rewards/:id/redeem
router.post('/:id/redeem', protect, requireRole('trainee'), async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });

    // Atomic check-and-deduct: only succeeds if the user still has enough credits
    // at the moment of update, preventing a race condition from double-redeeming.
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: reward.cost } },
      { $inc: { credits: -reward.cost } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    await CreditTransaction.create({
      user: req.user._id,
      label: `Reward Redeemed — ${reward.title}`,
      amount: -reward.cost,
      type: 'redeem',
      icon: '🎁',
    });

    const redemption = await Redemption.create({
      user: req.user._id,
      reward: reward._id,
      title: reward.title,
      cost: reward.cost,
      status: 'Delivered',
    });

    res.status(201).json({ redemption, newBalance: updatedUser.credits });
  } catch (err) {
    res.status(500).json({ message: 'Failed to redeem reward', error: err.message });
  }
});

export default router;
