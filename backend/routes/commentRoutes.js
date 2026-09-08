import express from 'express';
import Comment from '../models/Comment.js';
import { protect, requireRole } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// GET /api/comments/:courseId/:lessonId
router.get('/:courseId/:lessonId', async (req, res) => {
  try {
    const comments = await Comment.find({
      course: req.params.courseId,
      lessonId: req.params.lessonId,
    }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
});

// POST /api/comments   Body: { courseId, lessonId, text }
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, lessonId, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const comment = await Comment.create({
      course: courseId,
      lessonId,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      text: text.trim(),
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment', error: err.message });
  }
});
// GET /api/comments/trainer/summary — doubt counts per course, for the logged-in trainer
router.get('/trainer/summary', protect, requireRole('trainer'), async (req, res) => {
  try {
    const courses = await Course.find({ trainer: req.user._id }).select('_id');
    const courseIds = courses.map((c) => c._id);
    const counts = await Comment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doubt summary', error: err.message });
  }
});

export default router;