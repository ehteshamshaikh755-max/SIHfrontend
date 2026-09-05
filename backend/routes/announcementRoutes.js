import express from 'express';
import Announcement from '../models/Announcement.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/announcements — public, latest 5
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch announcements', error: err.message });
  }
});

// POST /api/announcements — admin only
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body are required' });

    const announcement = await Announcement.create({ title, body, postedBy: req.user._id });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create announcement', error: err.message });
  }
});

export default router;