import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import CreditTransaction from '../models/CreditTransaction.js';
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

// ---- Platform analytics ----

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalTrainees = await User.countDocuments({ role: 'trainee' });
    const totalTrainers = await User.countDocuments({ role: 'trainer', status: 'approved' });
    const totalCourses = await Course.countDocuments();
    const pendingCourses = await Course.countDocuments({ status: 'Pending Approval' });

    const allEnrollments = await Enrollment.find();
    const completedEnrollments = allEnrollments.filter((e) => e.status === 'completed').length;
    const completionRate = allEnrollments.length > 0
      ? Math.round((completedEnrollments / allEnrollments.length) * 100)
      : 0;

    // Credits distributed = sum of all positive transactions; redeemed = sum of all negative ones (absolute value)
    const allTxns = await CreditTransaction.find();
    const creditsDistributed = allTxns.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const creditsRedeemed = Math.abs(allTxns.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

    const mostPopular = await Course.find({ status: 'Approved' })
      .sort({ learners: -1 })
      .limit(5)
      .select('title learners');

    const topTrainers = await User.find({ role: 'trainer', status: 'approved' })
      .sort({ contributionCredits: -1 })
      .limit(5)
      .select('name contributionCredits');

    const topLearners = await User.find({ role: 'trainee' })
      .sort({ credits: -1 })
      .limit(5)
      .select('name credits');

    const medalFor = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '');

    res.json({
      totalTrainees,
      totalTrainers,
      totalCourses,
      pendingCourses,
      completionRate,
      creditsDistributed,
      creditsRedeemed,
      mostPopular: mostPopular.map((c) => ({ title: c.title, learners: c.learners })),
      topTrainers: topTrainers.map((t, i) => ({ rank: i + 1, name: t.name, credits: t.contributionCredits, badge: medalFor(i + 1) })),
      topLearners: topLearners.map((t, i) => ({ rank: i + 1, name: t.name, credits: t.credits, badge: medalFor(i + 1) })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
});

export default router;