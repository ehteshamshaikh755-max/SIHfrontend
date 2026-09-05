import express from 'express';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/certificates/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .populate('course', 'title category')
      .sort({ issuedAt: -1 });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch certificates', error: err.message });
  }
});

// GET /api/certificates/verify/:certId  (public, no auth needed)
router.get('/verify/:certId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certId: req.params.certId })
      .populate('user', 'name')
      .populate('course', 'title category');
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });
    res.json({
      valid: true,
      certId: cert.certId,
      holderName: cert.user.name,
      courseTitle: cert.course.title,
      score: cert.score,
      issuedAt: cert.issuedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

export default router;
