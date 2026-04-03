const Survey = require('../models/Survey.model');
const Response = require('../models/Response.model');
const { getIO } = require('../config/socket');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

exports.createSurvey = async (req, res, next) => {
  try {
    const { title, description, questions, settings } = req.body;

    const survey = await Survey.create({
      title,
      description,
      questions,
      settings,
      creator: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: {
        survey,
        shareableUrl: `${process.env.SURVEY_LINK_BASE_URL}/${survey.shareToken}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMySurveys = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { creator: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Use default pagination if mongoose-paginate-v2 is not doing the heavy lifting out of box or we implement simple pagination manually
    // We didn't enable pagination plugin on schema. Implementing manually:
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [surveys, total] = await Promise.all([
      Survey.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit)).select('-questions'),
      Survey.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        surveys,
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

exports.getSurveyById = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('creator', 'name email');
    
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    if (survey.creator._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this survey' });
    }

    res.json({
      success: true,
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSurvey = async (req, res, next) => {
  try {
    const { title, description, questions, settings, status } = req.body;
    
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    
    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (title) survey.title = title;
    if (description !== undefined) survey.description = description;
    if (status) survey.status = status;
    if (questions) {
      // Validate order logic if needed
      survey.questions = questions;
    }
    if (settings) {
      survey.settings = { ...survey.settings, ...settings };
    }

    await survey.save();

    res.json({
      success: true,
      data: { survey },
      message: survey.status === 'active' && survey.stats.totalResponses > 0 
        ? 'Survey updated. Note: Questions edited on an active survey might affect display of existing responses.' 
        : 'Survey updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    
    if (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    try {
      await Response.deleteMany({ survey: survey._id });
      await Survey.findByIdAndDelete(survey._id);
    } catch (err) {
      throw err;
    }

    res.json({
      success: true,
      message: 'Survey and entirely associated responses deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSurveyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['draft', 'active', 'closed', 'archived'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    
    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (survey.status === 'archived' && status !== 'archived') {
       return res.status(400).json({ success: false, message: 'Cannot unarchive survey directly. Please contact support or duplicate instead.' });
    }

    if (status === 'active' && survey.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot activate a survey with 0 questions.' });
    }

    survey.status = status;
    await survey.save();

    try {
      const io = getIO();
      io.to(`survey:${survey._id}`).emit('survey:status_changed', {
        surveyId: survey._id,
        status: survey.status
      });
    } catch (e) {}

    res.json({
      success: true,
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSurveySettings = async (req, res, next) => {
  exports.updateSurvey(req, res, next);
};

exports.duplicateSurvey = async (req, res, next) => {
  try {
    const original = await Survey.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Survey not found' });
    
    // Allows creator to duplicate, arguably someone else could duplicate public surveys but let's stick to creator
    if (original.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Prepare questions with new internal IDs to avoid collisions
    const duplicatedQuestions = original.questions.map(q => {
      const dq = q.toObject();
      dq._id = uuidv4();
      if (dq.options) {
        dq.options = dq.options.map(opt => ({ ...opt, _id: uuidv4() }));
      }
      return dq;
    });

    const newSurvey = await Survey.create({
      title: `Copy of ${original.title}`,
      description: original.description,
      creator: req.user._id,
      questions: duplicatedQuestions,
      settings: original.settings,
      status: 'draft',
      shareToken: uuidv4().replace(/-/g, '').substring(0, 12),
      tags: original.tags,
    });

    res.status(201).json({
      success: true,
      data: { survey: newSurvey },
    });
  } catch (error) {
    next(error);
  }
};

exports.exportSurveyData = async (req, res, next) => {
  res.json({ success: true, message: 'Use dedicated export API (/api/v1/export)' });
};

exports.getPublicSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ shareToken: req.params.shareToken });
    
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found', status: 'not_found' });
    }

    const isCreator = req.user && req.user._id.toString() === survey.creator.toString();

    if (survey.status !== 'active' && !isCreator) {
       return res.status(403).json({ success: false, message: 'Survey is not active', status: survey.status });
    }

    if (!isCreator && (survey.isExpired || !survey.isAcceptingResponses)) {
      return res.status(403).json({ success: false, message: 'Survey has closed or reached maximum responses', status: 'closed' });
    }

    // Note: Deduplication check is done in Response Collection API on submission, but we might want to check here to reject early.
    // For now we'll do it on submission as per instructions.

    // Return the safe view 
    const safeSurvey = {
      _id: survey._id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions.map(q => {
        const o = q.toObject();
        // Remove internal stuff if needed, though they need the text and options.
        return o;
      }),
      settings: {
        showProgressBar: survey.settings.showProgressBar,
        showQuestionNumbers: survey.settings.showQuestionNumbers,
        thankYouMessage: survey.settings.thankYouMessage,
        theme: survey.settings.theme,
      }
    };

    res.json({
      success: true,
      data: { survey: safeSurvey },
    });
  } catch (error) {
    next(error);
  }
};
