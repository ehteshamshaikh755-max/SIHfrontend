import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, dept } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['trainee', 'trainer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for signup' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, dept });

    // Trainers are 'pending' by default (see User model) — no token issued yet.
    if (user.role === 'trainer' && user.status === 'pending') {
      return res.status(201).json({
        message: 'Signup successful. Your trainer account is awaiting admin approval.',
        pendingApproval: true,
      });
    }

    // Trainees get logged in immediately.
    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dept: user.dept,
        credits: user.credits,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.role === 'trainer' && user.status === 'pending') {
      return res.status(403).json({ message: 'Your trainer account is still awaiting admin approval' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account has been rejected. Contact admin.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dept: user.dept,
        credits: user.credits,
        contributionCredits: user.contributionCredits,
        qualifications: user.qualifications,
        workExperience: user.workExperience,
        interests: user.interests,
        trainerCompetencies: user.trainerCompetencies,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me — update own profile (name, dept, qualifications, work
// experience, interests, and optionally password)
router.patch('/me', protect, async (req, res) => {
  try {
    const {
      name, dept, qualifications, workExperience, interests,
      currentPassword, newPassword,
    } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (dept !== undefined) user.dept = dept;
    if (qualifications !== undefined) user.qualifications = qualifications;
    if (workExperience !== undefined) user.workExperience = workExperience;
    if (interests !== undefined) user.interests = interests;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dept: user.dept,
        credits: user.credits,
        contributionCredits: user.contributionCredits,
        qualifications: user.qualifications,
        workExperience: user.workExperience,
        interests: user.interests,
        trainerCompetencies: user.trainerCompetencies,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// PATCH /api/auth/me/competencies — trainer-only: update subject competencies
// Body: { competencies: [{ subject, level }] }
router.patch('/me/competencies', protect, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers can set competencies' });
    }
    const { competencies } = req.body;
    const user = await User.findById(req.user._id);
    user.trainerCompetencies = competencies || [];
    await user.save();
    res.json({ trainerCompetencies: user.trainerCompetencies });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update competencies', error: err.message });
  }
});

// GET /api/auth/trainers/by-subject?subject=X — admin-only: find trainers competent in a subject
router.get('/trainers/by-subject', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { subject } = req.query;
    const filter = { role: 'trainer', status: 'approved' };
    if (subject) filter['trainerCompetencies.subject'] = { $regex: subject, $options: 'i' };

    const trainers = await User.find(filter).select('name email dept trainerCompetencies contributionCredits');
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainers', error: err.message });
  }
});

export default router;