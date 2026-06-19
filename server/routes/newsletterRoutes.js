import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

router.post('/newsletter', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
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
