import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/skills/mine
// Returns the trainee's current skills, plus a recommended next skill
// (a skill that appears often in approved courses but the trainee doesn't have yet, or is lowest).
router.get('/mine', protect, requireRole('trainee'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Build a frequency map of skills across all approved courses,
    // to suggest something popular the trainee hasn't picked up yet.
    const approvedCourses = await Course.find({ status: 'Approved' });
    const skillFrequency = {};
    approvedCourses.forEach((course) => {
      (course.skillsGained || []).forEach((skill) => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      });
    });

    const knownSkillNames = user.skills.map((s) => s.name);
    let recommended = null;
    let maxFreq = 0;
    Object.entries(skillFrequency).forEach(([skill, freq]) => {
      if (!knownSkillNames.includes(skill) && freq > maxFreq) {
        recommended = skill;
        maxFreq = freq;
      }
    });

    res.json({
      skills: user.skills,
      recommendedNextSkill: recommended,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch skills', error: err.message });
  }
});

export default router;