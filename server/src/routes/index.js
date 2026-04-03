const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimit.middleware');

const authRoutes = require('./auth.routes');
const surveyRoutes = require('./survey.routes');
const responseRoutes = require('./response.routes');
const analyticsRoutes = require('./analytics.routes');
// const exportRoutes = require('./export.routes');

// Apply general rate limit
router.use(apiLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/surveys', surveyRoutes);
router.use('/responses', responseRoutes);
router.use('/analytics', analyticsRoutes);
// router.use('/export', exportRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'SurveyForge API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      surveys: '/api/v1/surveys',
      responses: '/api/v1/responses',
      analytics: '/api/v1/analytics',
      export: '/api/v1/export',
    },
  });
});

module.exports = router;
