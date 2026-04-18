const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');

const validateSurvey = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('questions')
    .isArray({ min: 1, max: 50 }).withMessage('Survey must have 1 to 50 questions'),

  body('questions.*.text')
    .trim()
    .notEmpty().withMessage('Question text cannot be empty')
    .isLength({ max: 1000 }),

  body('questions.*.type')
    .isIn(['multiple_choice', 'single_choice', 'rating', 'short_text', 'long_text', 'text', 'textarea', 'yes_no', 'checkbox'])
    .withMessage('Invalid question type'),

  body('questions.*.options')
    .if(body('questions.*.type').isIn(['multiple_choice', 'single_choice', 'yes_no', 'checkbox']))
    .isArray({ min: 2, max: 20 })
    .withMessage('Choice questions must have 2 to 20 options'),

  validate,
];

module.exports = { validateSurvey };
