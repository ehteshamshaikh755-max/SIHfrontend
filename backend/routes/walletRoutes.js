import express from 'express';
import CreditTransaction from '../models/CreditTransaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wallet/mine
// Works for both trainees (credits) and trainers (contributionCredits) —
// the balance field returned depends on the logged-in user's role.
router.get('/mine', protect, async (req, res) => {
  try {
    const balance = req.user.role === 'trainer' ? req.user.contributionCredits : req.user.credits;

    const transactions = await CreditTransaction.find({ user: req.user._id })
      .sort({ date: -1 });

    res.json({ balance, transactions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wallet', error: err.message });
  }
});

export default router;
