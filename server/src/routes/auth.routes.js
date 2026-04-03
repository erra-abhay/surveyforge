const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { protect } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, updateProfileValidator, authController.updateProfile);
router.patch('/change-password', protect, changePasswordValidator, authController.changePassword);

module.exports = router;
