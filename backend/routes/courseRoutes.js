import express from 'express';
import Course from '../models/Course.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses?status=Approved&category=X&difficulty=Y&search=text
// Public listing — trainees only ever see Approved courses regardless of query.
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const filter = { status: 'Approved' };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter)
      .populate('trainer', 'name')
      .select('-modules.lessons.videoUrl'); // don't leak video URLs in list view

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
  }
});

// GET /api/courses/:id  — full course detail, including modules/lessons
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('trainer', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course', error: err.message });
  }
});

// GET /api/courses/mine/list — trainer's own courses, any status
router.get('/mine/list', protect, requireRole('trainer'), async (req, res) => {
  try {
    const courses = await Course.find({ trainer: req.user._id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your courses', error: err.message });
  }
});

// POST /api/courses  — create a course (whole thing: details + modules + lessons at once)
// Body: { title, description, category, difficulty, duration, thumbnail, objectives,
//         modules: [{ title, lessons: [{ title, duration, type, videoUrl }] }],
//         skillsGained, submitForApproval: true|false }
router.post('/', protect, requireRole('trainer'), async (req, res) => {
  try {
    const {
      title, description, category, difficulty, duration, thumbnail,
      objectives, modules, skillsGained, submitForApproval,
    } = req.body;

    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({ message: 'Missing required course fields' });
    }

    const course = await Course.create({
      title, description, category, difficulty, duration, thumbnail,
      objectives: objectives || [],
      modules: modules || [],
      skillsGained: skillsGained || [],
      trainer: req.user._id,
      status: submitForApproval ? 'Pending Approval' : 'Draft',
      submittedOn: submitForApproval ? new Date() : null,
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course', error: err.message });
  }
});

// PATCH /api/courses/:id — edit a course (only the owning trainer, and only if not yet Approved)
router.patch('/:id', protect, requireRole('trainer'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (String(course.trainer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const editable = [
      'title', 'description', 'category', 'difficulty', 'duration',
      'thumbnail', 'objectives', 'modules', 'skillsGained',
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    // Re-submitting for approval after edits (e.g. after a rejection)
    if (req.body.submitForApproval) {
      course.status = 'Pending Approval';
      course.submittedOn = new Date();
      course.rejectionReason = '';
    }

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update course', error: err.message });
  }
});

// DELETE /api/courses/:id — only the owning trainer
router.delete('/:id', protect, requireRole('trainer'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (String(course.trainer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your course' });
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete course', error: err.message });
  }
});

export default router;
