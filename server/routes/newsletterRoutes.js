import express from 'express';
import rateLimit from 'express-rate-limit';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many subscription attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/newsletter', newsletterLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.json({ message: 'You are already subscribed!' });
    }

    await Newsletter.create({ email });
    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ message: 'Could not subscribe. Please try again.' });
  }
});

export default router;
