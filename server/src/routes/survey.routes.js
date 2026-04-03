const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const surveyController = require('../controllers/survey.controller');
const { validateSurvey } = require('../validators/survey.validator');

// ─── Creator Routes (requires auth) ──────────────────────────────────────
router.post('/', protect, validateSurvey, surveyController.createSurvey);
router.get('/my', protect, surveyController.getMySurveys);
router.get('/:id', protect, surveyController.getSurveyById);
router.put('/:id', protect, validateSurvey, surveyController.updateSurvey);
router.delete('/:id', protect, surveyController.deleteSurvey);
router.patch('/:id/status', protect, surveyController.updateSurveyStatus);
router.patch('/:id/settings', protect, surveyController.updateSurveySettings);
router.post('/:id/duplicate', protect, surveyController.duplicateSurvey);
router.get('/:id/export', protect, surveyController.exportSurveyData);

// ─── Public Route (no auth required) ─────────────────────────────────────
router.get('/public/:shareToken', optionalAuth, surveyController.getPublicSurvey);

module.exports = router;
