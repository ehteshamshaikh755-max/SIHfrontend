import express from 'express';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/achievements/mine
router.get('/mine', protect, requireRole('trainee'), async (req, res) => {
  try {
    const userId = req.user._id;

    const completedCount = await Enrollment.countDocuments({ user: userId, status: 'completed' });
    const perfectQuizCount = await QuizAttempt.countDocuments({ user: userId, score: 100 });

    // Determine if this trainee currently holds the #1 credits rank among trainees
    const topTrainee = await User.findOne({ role: 'trainee' }).sort({ credits: -1 });
    const isTopLearner = topTrainee && String(topTrainee._id) === String(userId);

    const achievements = [
      {
        id: 'a1', title: 'First Course', desc: 'Completed your first course',
        icon: '🎓', earned: completedCount >= 1,
      },
      {
        id: 'a2', title: '5 Courses Completed', desc: 'Finished 5 full courses',
        icon: '🏅', earned: completedCount >= 5,
      },
      {
        id: 'a3', title: '7-Day Learning Streak', desc: 'Learned for 7 days in a row',
        icon: '🔥', earned: false,
      },
      {
        id: 'a4', title: 'Top Learner', desc: 'Ranked #1 by credits',
        icon: '🏆', earned: !!isTopLearner,
      },
      {
        id: 'a5', title: 'Knowledge Contributor', desc: 'Left 10 helpful course reviews',
        icon: '💬', earned: false,
      },
      {
        id: 'a6', title: 'Quiz Master', desc: 'Scored 100% on 3 quizzes',
        icon: '🎯', earned: perfectQuizCount >= 3,
      },
    ];

    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch achievements', error: err.message });
  }
});

export default router;