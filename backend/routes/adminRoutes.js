import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes below require an admin
router.use(protect, requireRole('admin'));

// ---- Course approval ----

// GET /api/admin/courses/pending
router.get('/courses/pending', async (req, res) => {
  const courses = await Course.find({ status: 'Pending Approval' }).populate('trainer', 'name email');
  res.json(courses);
});

// PATCH /api/admin/courses/:id/approve
router.patch('/courses/:id/approve', async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'Approved', rejectionReason: '' },
    { new: true }
  );
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// PATCH /api/admin/courses/:id/reject   Body: { rejectionReason }
router.patch('/courses/:id/reject', async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) return res.status(400).json({ message: 'rejectionReason is required' });

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'Rejected', rejectionReason },
    { new: true }
  );
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// GET /api/admin/trainers/pending
router.get('/trainers/pending', async (req, res) => {
  const pending = await User.find({ role: 'trainer', status: 'pending' }).select('-password');
  res.json(pending);
});

// PATCH /api/admin/trainers/:id/approve
router.patch('/trainers/:id/approve', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// PATCH /api/admin/trainers/:id/reject
router.patch('/trainers/:id/reject', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
