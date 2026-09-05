import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

// GET /api/home/stats — public quick stats strip
router.get('/stats', async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments({ status: 'Approved' });
    const totalLearners = await User.countDocuments({ role: 'trainee' });
    const certificatesIssued = await Certificate.countDocuments();

    res.json({ totalCourses, totalLearners, certificatesIssued });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch home stats', error: err.message });
  }
});

// GET /api/home/popular — top 5 most-enrolled approved courses
router.get('/popular', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'Approved' })
      .sort({ learners: -1 })
      .limit(5)
      .populate('trainer', 'name')
      .select('title category difficulty thumbnail learners rating');

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch popular courses', error: err.message });
  }
});

export default router;