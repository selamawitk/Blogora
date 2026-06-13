import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    secret,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function userResponse(user, token) {
  return {
    id: user._id,
    _id: user._id,
    email: user.email,
    username: user.username,
    bio: user.bio || '',
    linkedinUrl: user.linkedinUrl || '',
    twitterUrl: user.twitterUrl || '',
    githubUrl: user.githubUrl || '',
    websiteUrl: user.websiteUrl || '',
    token,
  };
}

const register = async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const bio = String(req.body.bio || '').trim();
    const linkedinUrl = String(req.body.linkedinUrl || '').trim();
    const twitterUrl = String(req.body.twitterUrl || '').trim();
    const githubUrl = String(req.body.githubUrl || '').trim();
    const websiteUrl = String(req.body.websiteUrl || '').trim();

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Please fill all fields.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const user = new User({ email, username, password, bio, linkedinUrl, twitterUrl, githubUrl, websiteUrl });
    await user.save();

    const token = generateToken(user);
    res.status(201).json(userResponse(user, token));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const signIn = async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Server error during sign-in.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email exists.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Password reset link sent to your email.',
      resetToken,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Could not process password reset request.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const newPassword = String(req.body.password || '');
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user);
    res.json({
      message: 'Password reset successful.',
      ...userResponse(user, token),
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Could not reset password.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { bio, linkedinUrl, twitterUrl, githubUrl, websiteUrl } = req.body;

    if (bio !== undefined) user.bio = String(bio).trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = String(linkedinUrl).trim();
    if (twitterUrl !== undefined) user.twitterUrl = String(twitterUrl).trim();
    if (githubUrl !== undefined) user.githubUrl = String(githubUrl).trim();
    if (websiteUrl !== undefined) user.websiteUrl = String(websiteUrl).trim();

    await user.save();

    const token = generateToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Could not update profile.' });
  }
};

export { register, signIn, forgotPassword, resetPassword, updateProfile };
