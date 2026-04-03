const User = require('../models/User.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const refreshToken = generateRefreshToken();

    const user = await User.create({
      name,
      email,
      password,
      refreshToken,
      lastLogin: new Date(),
    });

    const accessToken = generateAccessToken(user._id);

    // Replace the default token with a specific token for this user
    const specificRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = specificRefreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        accessToken,
        refreshToken: specificRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({ _id: decoded.id }).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('surveyCount');
    res.json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    await user.save();

    res.json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate sessions
    await user.save();

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};
