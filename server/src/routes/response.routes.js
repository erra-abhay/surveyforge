const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { submissionLimiter } = require('../middleware/rateLimit.middleware');
const responseController = require('../controllers/response.controller');

// Public — submit a response
router.post('/survey/:shareToken', optionalAuth, submissionLimiter, responseController.submitResponse);

// Protected — get responses for a survey
router.get('/survey/:surveyId', protect, responseController.getSurveyResponses);
router.get('/:responseId', protect, responseController.getResponseById);
router.delete('/:responseId', protect, responseController.deleteResponse);

module.exports = router;
