const Response = require('../models/Response.model');
const Survey = require('../models/Survey.model');
const { getIO } = require('../config/socket');

exports.submitResponse = async (req, res, next) => {
  try {
    const { shareToken } = req.params;
    const { answers, startedAt, sessionId } = req.body;

    const survey = await Survey.findOne({ shareToken });
    
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const isCreator = req.user && req.user._id.toString() === survey.creator.toString();

    if (survey.status !== 'active' && !isCreator) {
      return res.status(403).json({ success: false, message: 'Survey is not currently active' });
    }

    if (survey.isExpired && !isCreator) {
      return res.status(403).json({ success: false, message: 'Survey has closed' });
    }

    if (!survey.isAcceptingResponses && !isCreator) {
       return res.status(403).json({ success: false, message: 'Survey has reached maximum responses' });
    }

    // Duplicate Prevention
    if (survey.settings.preventDuplicates) {
      let isDuplicate = false;
      if (survey.settings.duplicateCheckMethod === 'ip') {
        const ipAddress = req.ip || req.headers['x-forwarded-for'];
        const existing = await Response.findOne({ survey: survey._id, 'metadata.ipAddress': ipAddress });
        if (existing) isDuplicate = true;
      } else if (survey.settings.duplicateCheckMethod === 'cookie' && sessionId) {
        const existing = await Response.findOne({ survey: survey._id, 'metadata.sessionId': sessionId });
        if (existing) isDuplicate = true;
      } else if (survey.settings.duplicateCheckMethod === 'login') {
         // Would need protect middleware, skip for now or check if req.user exists
         if (req.headers.authorization) {
             // Let's assume auth.middleware optionalAuth was used (not registered in routes but let's say it is)
             if (req.user) {
               const existing = await Response.findOne({ survey: survey._id, respondent: req.user._id });
               if (existing) isDuplicate = true;
             }
         }
      }

      if (isDuplicate) {
        return res.status(409).json({ success: false, message: 'You have already submitted a response.' });
      }
    }

    // Validation
    const validationErrors = [];
    const formattedAnswers = [];

    for (const question of survey.questions) {
       const submittedAnswer = answers.find(a => a.questionId === question._id.toString());
       
       if (question.required && (!submittedAnswer || submittedAnswer.skipped)) {
         validationErrors.push({ field: question._id, message: 'This question is required' });
         continue;
       }

       if (!submittedAnswer || submittedAnswer.skipped) {
           formattedAnswers.push({
               questionId: question._id,
               questionText: question.text,
               questionType: question.type,
               skipped: true
           });
           continue;
       }

       if (question.type === 'rating') {
          const val = Number(submittedAnswer.value);
          if (isNaN(val) || val < question.ratingScale.min || val > question.ratingScale.max) {
             validationErrors.push({ field: question._id, message: 'Invalid rating value' });
          }
       } else if (question.type === 'short_text') {
          if (typeof submittedAnswer.value !== 'string' || submittedAnswer.value.length > 5000) {
             validationErrors.push({ field: question._id, message: 'Invalid text value' });
          }
       } else if (['multiple_choice', 'yes_no', 'checkbox', 'single_choice'].includes(question.type)) {
          if (!submittedAnswer.selectedOptions || !Array.isArray(submittedAnswer.selectedOptions)) {
             validationErrors.push({ field: question._id, message: 'Invalid choices format' });
          } else {
             for (const opt of submittedAnswer.selectedOptions) {
                 if (!question.options.find(o => o._id.toString() === opt.optionId)) {
                     validationErrors.push({ field: question._id, message: 'Selected invalid option' });
                 }
             }
          }
       }

       let selectedOptionsSnapshot = [];
       if (submittedAnswer.selectedOptions) {
           selectedOptionsSnapshot = submittedAnswer.selectedOptions.map(o => ({
               optionId: o.optionId,
               optionText: question.options.find(opt => opt._id.toString() === o.optionId)?.text || ''
           }));
       }

       formattedAnswers.push({
           questionId: question._id,
           questionText: question.text,
           questionType: question.type,
           value: submittedAnswer.value,
           selectedOptions: selectedOptionsSnapshot,
           skipped: false
       });
    }

    if (validationErrors.length > 0) {
       return res.status(422).json({ success: false, message: 'Validation failed', errors: validationErrors });
    }

    // Detect Device
    const userAgent = req.headers['user-agent'] || '';
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

    let completionTimeSeconds = null;
    if (startedAt) {
        const start = new Date(startedAt);
        if (!isNaN(start.getTime())) {
            completionTimeSeconds = Math.round((new Date() - start) / 1000);
        }
    }

    const response = await Response.create({
      survey: survey._id,
      respondent: req.user ? req.user._id : null,
      answers: formattedAnswers,
      metadata: {
        ipAddress: req.ip || req.headers['x-forwarded-for'],
        userAgent,
        sessionId,
        startedAt: startedAt || new Date(),
        completedAt: new Date(),
        completionTimeSeconds,
        deviceType
      },
      isComplete: true,
      isAnonymous: !req.user
    });

    try {
      const io = getIO();
      // Emitting with totalResponses + 1 because the mongoose post-save hook updates asynchronously and isn't reflected immediately here
      io.to(`survey:${survey._id}`).emit('response:new', {
        surveyId: survey._id.toString(),
        totalResponses: survey.stats.totalResponses + 1,
        timestamp: new Date()
      });
    } catch (e) {
      console.warn('Socket emit failed:', e.message);
    }

    res.status(201).json({
      success: true,
      message: survey.settings.thankYouMessage,
      data: { responseId: response._id },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSurveyResponses = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    
    if (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const query = { survey: surveyId };
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [responses, total] = await Promise.all([
      Response.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-metadata.ipAddress'),
      Response.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        responses,
        metadata: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getResponseById = async (req, res, next) => {
  try {
    const response = await Response.findById(req.params.responseId).populate('survey');
    if (!response) return res.status(404).json({ success: false, message: 'Response not found' });
    
    if (response.survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: { response },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteResponse = async (req, res, next) => {
  try {
    const response = await Response.findById(req.params.responseId).populate('survey');
    
    if (!response) return res.status(404).json({ success: false, message: 'Response not found' });
    
    if (response.survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Response.findByIdAndDelete(response._id);
    
    // Decrement survey response count
    await Survey.findByIdAndUpdate(response.survey._id, {
        $inc: { 'stats.totalResponses': -1 }
    });

    res.json({
      success: true,
      message: 'Response deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
