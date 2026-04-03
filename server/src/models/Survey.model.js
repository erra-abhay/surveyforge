const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Sub-schema: Option (for multiple choice)
const optionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Option text cannot exceed 500 characters'],
  },
  order: { type: Number, default: 0 },
});

// Sub-schema: Question
const questionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question text cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'single_choice', 'rating', 'short_text', 'long_text', 'text', 'textarea', 'yes_no', 'checkbox'],
    required: [true, 'Question type is required'],
  },
  required: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  options: [optionSchema], // Only for multiple_choice, yes_no, checkbox
  ratingScale: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    minLabel: { type: String, default: 'Poor' },
    maxLabel: { type: String, default: 'Excellent' },
  },
  placeholder: {
    type: String,
    default: 'Your answer here...',
  },
});

// Main Survey schema
const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (v) {
          return v.length >= 1 && v.length <= 50;
        },
        message: 'A survey must have between 1 and 50 questions',
      },
    },
    shareToken: {
      type: String,
      unique: true,
      default: () => uuidv4().replace(/-/g, '').substring(0, 12),
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'draft',
    },
    settings: {
      allowAnonymous: { type: Boolean, default: true },
      preventDuplicates: { type: Boolean, default: false },
      duplicateCheckMethod: {
        type: String,
        enum: ['ip', 'cookie', 'login'],
        default: 'ip',
      },
      showProgressBar: { type: Boolean, default: true },
      showQuestionNumbers: { type: Boolean, default: true },
      randomizeQuestions: { type: Boolean, default: false },
      closeDate: { type: Date, default: null },
      maxResponses: { type: Number, default: null }, // null = unlimited
      thankYouMessage: {
        type: String,
        default: 'Thank you for your response!',
      },
      theme: {
        type: String,
        enum: ['default', 'minimal', 'dark', 'ocean', 'sunset'],
        default: 'default',
      },
    },
    stats: {
      totalResponses: { type: Number, default: 0 },
      lastResponseAt: { type: Date, default: null },
      completionRate: { type: Number, default: 0 },
    },
    tags: [{ type: String, trim: true, maxlength: 50 }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast lookups
surveySchema.index({ shareToken: 1 });
surveySchema.index({ creator: 1, status: 1 });
surveySchema.index({ createdAt: -1 });
surveySchema.index({ 'stats.totalResponses': -1 });

// Virtual: isExpired
surveySchema.virtual('isExpired').get(function () {
  if (!this.settings.closeDate) return false;
  return new Date() > new Date(this.settings.closeDate);
});

// Virtual: isAcceptingResponses
surveySchema.virtual('isAcceptingResponses').get(function () {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  if (
    this.settings.maxResponses &&
    this.stats.totalResponses >= this.settings.maxResponses
  )
    return false;
  return true;
});

// Pre-save: order questions by order field
surveySchema.pre('save', function () {
  this.questions.sort((a, b) => a.order - b.order);
});

module.exports = mongoose.model('Survey', surveySchema);
