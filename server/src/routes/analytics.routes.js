const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

router.get('/survey/:surveyId/overview', protect, analyticsController.getSurveyOverview);
router.get('/survey/:surveyId/question/:questionId', protect, analyticsController.getQuestionAnalytics);
router.get('/survey/:surveyId/trends', protect, analyticsController.getResponseTrends);
router.get('/dashboard', protect, analyticsController.getDashboardStats);
router.get('/:id/export/csv', protect, analyticsController.exportCSV);
router.get('/:id/export/pdf', protect, analyticsController.exportPDF);

module.exports = router;
