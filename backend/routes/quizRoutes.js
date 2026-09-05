import express from 'express';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';
import { protect, requireRole } from '../middleware/auth.js';
import { awardCredits } from '../utils/credits.js';

const router = express.Router();

function makeCertId(category) {
  const year = new Date().getFullYear();
  const code = (category || 'GEN').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'GN';
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `CC-${year}-${code}-${rand}`;
}

// GET /api/quizzes/:courseId — questions only, answers stripped out
router.get('/:courseId', protect, requireRole('trainee'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select('quizQuestions title passingScorePct');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const questions = course.quizQuestions.map((q) => ({ q: q.q, options: q.options }));
    res.json({ courseTitle: course.title, passingScorePct: course.passingScorePct, questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
  }
});

// POST /api/quizzes/:courseId/submit   Body: { answers: [chosenOptionIndex, ...] }
router.post('/:courseId/submit', protect, requireRole('trainee'), async (req, res) => {
  try {
    const { answers } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!Array.isArray(answers) || answers.length !== course.quizQuestions.length) {
      return res.status(400).json({ message: 'Answers must match number of questions' });
    }

    let correct = 0;
    course.quizQuestions.forEach((q, i) => {
      if (q.answer === answers[i]) correct += 1;
    });
    const score = Math.round((correct / course.quizQuestions.length) * 100);
    const passed = score >= course.passingScorePct;

    await QuizAttempt.create({
      user: req.user._id,
      course: course._id,
      score,
      passed,
      answers,
    });

    if (passed) {
      await awardCredits(req.user._id, 30, `Quiz Passed — ${course.title}`, '📝');

      // Issue a certificate on first pass (avoid duplicates on retries/re-passes)
      const existing = await Certificate.findOne({ user: req.user._id, course: course._id });
      if (!existing) {
        const certId = makeCertId(course.category);
        await Certificate.create({
          user: req.user._id,
          course: course._id,
          certId,
          score,
        });
        await awardCredits(req.user._id, 100, `Certificate Issued — ${course.title}`, '📜');
      }
    }

    res.json({ score, passed, correct, total: course.quizQuestions.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit quiz', error: err.message });
  }
});

export default router;
