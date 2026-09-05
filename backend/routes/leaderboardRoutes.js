import express from 'express';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const medalFor = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '');

// Computes a simple achievement icon list for a given user (reuses the same rules as /api/achievements/mine)
async function getEarnedIcons(user, topLearnerId) {
  const completedCount = await Enrollment.countDocuments({ user: user._id, status: 'completed' });
  const perfectQuizCount = await QuizAttempt.countDocuments({ user: user._id, score: 100 });
  const icons = [];
  if (completedCount >= 1) icons.push('🎓');
  if (completedCount >= 5) icons.push('🏅');
  if (String(user._id) === String(topLearnerId)) icons.push('🏆');
  if (perfectQuizCount >= 3) icons.push('🎯');
  return icons;
}

// GET /api/leaderboard?type=learners|trainers
router.get('/', protect, async (req, res) => {
  try {
    const type = req.query.type === 'trainers' ? 'trainer' : 'trainee';
    const creditField = type === 'trainer' ? 'contributionCredits' : 'credits';

    const users = await User.find({ role: type, status: 'approved' })
      .sort({ [creditField]: -1 })
      .limit(10);

    const topLearnerId = type === 'trainee' && users[0] ? users[0]._id : null;

    const rows = await Promise.all(
      users.map(async (u, idx) => {
        const rank = idx + 1;
        const icons = await getEarnedIcons(u, topLearnerId);
        return {
          rank,
          name: u.name,
          dept: u.dept || '—',
          credits: u[creditField],
          badge: medalFor(rank),
          isYou: String(u._id) === String(req.user._id),
          achievementIcons: icons,
        };
      })
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: err.message });
  }
});

export default router;