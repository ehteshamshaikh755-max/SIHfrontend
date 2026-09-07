import { updateSkillsOnCompletion } from '../utils/skills.js';
import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';
import { awardCredits, awardContributionCredits } from '../utils/credits.js';

const router = express.Router();

// POST /api/enrollments   Body: { courseId }
router.post('/', protect, requireRole('trainee'), async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'Approved') {
      return res.status(400).json({ message: 'Course not available for enrollment' });
    }

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) return res.status(409).json({ message: 'Already enrolled' });

    // If this course has a credit cost, verify balance and redeem before enrolling
    if (course.creditCost > 0) {
      const trainee = await User.findById(req.user._id);
      if ((trainee.credits || 0) < course.creditCost) {
        return res.status(400).json({
          message: `Not enough credits — you need ${course.creditCost} CC but have ${trainee.credits || 0} CC`,
        });
      }
      await awardCredits(
        req.user._id, -course.creditCost,
        `Redeemed for Course — ${course.title}`, '🪙'
      );
    }

    const enrollment = await Enrollment.create({ user: req.user._id, course: courseId });

    // Bump the course's learner count for display purposes
    course.learners += 1;
    await course.save();

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to enroll', error: err.message });
  }
});

// GET /api/enrollments/mine
router.get('/mine', protect, requireRole('trainee'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate('course');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch enrollments', error: err.message });
  }
});

// PATCH /api/enrollments/:id/progress   Body: { lessonId }
// Marks a lesson complete, recalculates progress %, and handles course-completion side effects.
router.patch('/:id/progress', protect, requireRole('trainee'), async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findById(req.params.id).populate('course');
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (String(enrollment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your enrollment' });
    }

    if (!enrollment.completedLessonIds.includes(lessonId)) {
      enrollment.completedLessonIds.push(lessonId);
    }

    // Recalculate progress against total lessons in the course
    const totalLessons = enrollment.course.modules.reduce(
      (sum, m) => sum + m.lessons.length, 0
    );
    const donePct = totalLessons > 0
      ? Math.round((enrollment.completedLessonIds.length / totalLessons) * 100)
      : 0;
    enrollment.progressPct = donePct;

    const justCompleted = donePct >= 100 && enrollment.status !== 'completed';
    if (justCompleted) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      // Award trainee credits for finishing the course
      await awardCredits(
        req.user._id, 50,
        `Course Completed — ${enrollment.course.title}`, '🎓'
      );

      // Award trainer contribution credits for a learner finishing their course
      await awardContributionCredits(
        enrollment.course.trainer, 20,
        `Learner Completion — ${enrollment.course.title}`, '👥'
      );
      await updateSkillsOnCompletion(req.user._id, enrollment.course.skillsGained);
    }

    await enrollment.save();
    res.json({ enrollment, justCompleted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress', error: err.message });
  }
});

export default router;
