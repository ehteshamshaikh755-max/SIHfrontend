import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/trainer-stats/courses
// Full analytics payload for the logged-in trainer's own courses.
router.get('/courses', protect, requireRole('trainer'), async (req, res) => {
  try {
    const courses = await Course.find({ trainer: req.user._id });
    const courseIds = courses.map((c) => c._id);

    const perCourse = await Promise.all(
      courses.map(async (c) => {
        const enrollments = await Enrollment.find({ course: c._id });
        const completedCount = enrollments.filter((e) => e.status === 'completed').length;
        const completionPct = enrollments.length > 0
          ? Math.round((completedCount / enrollments.length) * 100)
          : 0;

        return {
          title: c.title,
          status: c.status,
          learners: c.learners,
          rating: c.rating,
          completionPct,
          completedCount,
        };
      })
    );

    const totalLearners = perCourse.reduce((sum, c) => sum + c.learners, 0);
    const completions = perCourse.reduce((sum, c) => sum + c.completedCount, 0);
    const avgCompletion = perCourse.length > 0
      ? Math.round(perCourse.reduce((sum, c) => sum + c.completionPct, 0) / perCourse.length)
      : 0;
    const ratedCourses = perCourse.filter((c) => c.rating > 0);
    const avgRating = ratedCourses.length > 0
      ? (ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1)
      : '0.0';

    // Average quiz score across all attempts on this trainer's courses
    const quizAttempts = await QuizAttempt.find({ course: { $in: courseIds } });
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
      : 0;

    res.json({
      perCourse,
      totalLearners,
      completions,
      avgCompletion,
      avgRating,
      avgQuizScore,
      contributionCredits: req.user.contributionCredits,
      publishedCourses: perCourse.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainer stats', error: err.message });
  }
});

export default router;