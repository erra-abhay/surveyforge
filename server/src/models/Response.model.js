const mongoose = require('mongoose');

// Sub-schema: Individual answer
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionText: {
    type: String, // Snapshot at time of response
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'single_choice', 'rating', 'short_text', 'long_text', 'text', 'textarea', 'yes_no', 'checkbox'],
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // String for text, Number for rating, Array for checkbox
    required: false,
  },
  selectedOptions: [
    {
      optionId: String,
      optionText: String,
    },
  ],
  skipped: {
    type: Boolean,
    default: false,
  },
});

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous
    },
    answers: {
      type: [answerSchema],
      required: true,
    },
    metadata: {
      ipAddress: {
        type: String,
        select: false, // Private — only accessible explicitly
      },
      userAgent: {
        type: String,
        select: false,
      },
      sessionId: {
        type: String, // Cookie-based deduplication
        select: false,
      },
      startedAt: {
        type: Date,
        default: Date.now,
      },
      completedAt: {
        type: Date,
      },
      completionTimeSeconds: {
        type: Number, // How long the respondent took
      },
      referrer: String,
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
      },
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
responseSchema.index({ survey: 1, createdAt: -1 });
responseSchema.index({ survey: 1, 'metadata.ipAddress': 1 });
responseSchema.index({ survey: 1, respondent: 1 });
responseSchema.index({ createdAt: -1 });

// Post-save hook: Update survey stats
responseSchema.post('save', async function (doc) {
  try {
    const Survey = mongoose.model('Survey');
    await Survey.findByIdAndUpdate(doc.survey, {
      $inc: { 'stats.totalResponses': 1 },
      $set: { 'stats.lastResponseAt': doc.createdAt },
    });
  } catch (err) {
    console.error('Failed to update survey stats:', err);
  }
});

module.exports = mongoose.model('Response', responseSchema);
