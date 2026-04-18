const Survey = require('../models/Survey.model');
const Response = require('../models/Response.model');
const mongoose = require('mongoose');

exports.getSurveyOverview = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    
    // Verify ownership
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    if (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Basic Stats
    const totalResponses = survey.stats.totalResponses;
    
    const overview = {
        totalResponses,
        completionRate: 0, 
        avgCompletionTimeSeconds: 0,
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, unknown: 0 }
    };

    if (totalResponses > 0) {
        // Compute aggregation
        const aggResult = await Response.aggregate([
            { $match: { survey: survey._id } },
            {
                $group: {
                    _id: null,
                    avgCompletionTime: { $avg: "$metadata.completionTimeSeconds" },
                    desktop: { $sum: { $cond: [ { $eq: ["$metadata.deviceType", "desktop"] }, 1, 0 ] } },
                    mobile: { $sum: { $cond: [ { $eq: ["$metadata.deviceType", "mobile"] }, 1, 0 ] } },
                    tablet: { $sum: { $cond: [ { $eq: ["$metadata.deviceType", "tablet"] }, 1, 0 ] } },
                    unknown: { $sum: { $cond: [ { $eq: ["$metadata.deviceType", "unknown"] }, 1, 0 ] } },
                    completed: { $sum: { $cond: [ { $eq: ["$isComplete", true] }, 1, 0 ] } }
                }
            }
        ]);

        if (aggResult.length > 0) {
            const data = aggResult[0];
            overview.avgCompletionTimeSeconds = Math.round(data.avgCompletionTime || 0);
            overview.deviceBreakdown = {
                desktop: data.desktop,
                mobile: data.mobile,
                tablet: data.tablet,
                unknown: data.unknown
            };
            overview.completionRate = Math.round((data.completed / totalResponses) * 100);
        }
    }

    // Recent Activity (last 7 days trend)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Using manual group mapping because strictly `$dateToString` respects UTC and may be tricky.
    const recentActivityAgg = await Response.aggregate([
        { $match: { survey: survey._id, createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    
    const recentActivity = recentActivityAgg.map(r => ({ date: r._id, count: r.count }));

    // Question analytics
    const questionsBreakdown = [];
    
    for (const question of survey.questions) {
        const qData = {
           questionId: question._id,
           questionText: question.text,
           type: question.type,
           analytics: {}
        };
        
        const pipeline = [
            { $match: { survey: survey._id } },
            { $unwind: "$answers" },
            { $match: { "answers.questionId": question._id.toString() } }
        ];

        if (['multiple_choice', 'single_choice', 'yes_no', 'checkbox'].includes(question.type)) {
            const optionAgg = await Response.aggregate([
                ...pipeline,
                { $unwind: { path: "$answers.selectedOptions", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$answers.selectedOptions.optionId",
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            const totalSkippedAgg = await Response.aggregate([
                ...pipeline,
                { $match: { "answers.skipped": true } },
                { $count: "skipped" }
            ]);
            const totalSkipped = totalSkippedAgg.length > 0 ? totalSkippedAgg[0].skipped : 0;
            const totalAnswered = totalResponses - totalSkipped;

            const optionsMap = {};
            question.options.forEach(o => {
                optionsMap[o._id.toString()] = {
                    optionId: o._id,
                    text: o.text,
                    count: 0,
                    percentage: 0
                };
            });
            
            let mostPopular = null;
            let maxCount = -1;

            optionAgg.forEach(r => {
                if (r._id && optionsMap[r._id]) {
                    optionsMap[r._id].count = r.count;
                    optionsMap[r._id].percentage = totalAnswered > 0 ? Math.round((r.count / totalAnswered) * 100) : 0;
                    if (r.count > maxCount) {
                        maxCount = r.count;
                        mostPopular = optionsMap[r._id].text;
                    }
                }
            });

            qData.analytics = {
                totalAnswered,
                totalSkipped,
                options: Object.values(optionsMap),
                mostPopular
            };
        } else if (question.type === 'rating') {
            const ratingAgg = await Response.aggregate([
                ...pipeline,
                { $match: { "answers.skipped": false } },
                {
                    $group: {
                        _id: "$answers.value",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const ratingStats = await Response.aggregate([
                ...pipeline,
                { $match: { "answers.skipped": false, "answers.value": { $type: "number" } } },
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$answers.value" },
                        answered: { $sum: 1 },
                        excellent: { $sum: { $cond: [ {$gte: ["$answers.value", 4] }, 1, 0] } },
                    }
                }
            ]);

            const totalSkippedAgg = await Response.aggregate([
                ...pipeline,
                { $match: { "answers.skipped": true } },
                { $count: "skipped" }
            ]);
            const totalSkipped = totalSkippedAgg.length > 0 ? totalSkippedAgg[0].skipped : 0;

            const dist = {};
            for (let i = question.ratingScale.min; i <= question.ratingScale.max; i++) {
                dist[i] = 0;
            }
            ratingAgg.forEach(r => {
                if (dist[r._id] !== undefined) dist[r._id] = r.count;
            });

            if (ratingStats.length > 0) {
                const stat = ratingStats[0];
                qData.analytics = {
                    distribution: dist,
                    averageRating: Math.round(stat.avg * 100) / 100,
                    totalAnswered: stat.answered,
                    totalSkipped,
                    satisfactionScore: Math.round((stat.excellent / stat.answered) * 100)
                };
            } else {
                 qData.analytics = {
                    distribution: dist,
                    averageRating: 0,
                    totalAnswered: 0,
                    totalSkipped,
                    satisfactionScore: 0
                };
            }
        } else if (['text', 'textarea', 'short_text', 'long_text'].includes(question.type)) {
             const textAgg = await Response.aggregate([
                ...pipeline,
                { $match: { "answers.skipped": false } },
                { $sort: { createdAt: -1 } },
                { $limit: 10 },
                { $project: { _id: 0, text: "$answers.value" } }
            ]);

            const totalSkippedAgg = await Response.aggregate([
                ...pipeline,
                { $match: { "answers.skipped": true } },
                { $count: "skipped" }
            ]);
            const totalSkipped = totalSkippedAgg.length > 0 ? totalSkippedAgg[0].skipped : 0;

            qData.analytics = {
                totalAnswered: totalResponses - totalSkipped,
                totalSkipped,
                sampleResponses: textAgg.map(r => r.text)
            };
        }

        questionsBreakdown.push(qData);
    }

    res.json({
      success: true,
      data: {
        surveyId: survey._id,
        surveyTitle: survey.title,
        shareToken: survey.shareToken,
        overview,
        recentActivity,
        questions: questionsBreakdown
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionAnalytics = async (req, res, next) => {
    try {
        const { surveyId, questionId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const survey = await Survey.findById(surveyId);
        if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
        if (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const question = survey.questions.id(questionId) || survey.questions.find(q => q._id.toString() === questionId);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const answers = await Response.aggregate([
            { $match: { survey: survey._id } },
            { $unwind: "$answers" },
            { $match: { "answers.questionId": questionId, "answers.skipped": false } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            { 
                $project: { 
                    _id: 1, 
                    value: "$answers.value", 
                    createdAt: 1,
                    respondent: 1
                } 
            }
        ]);

        const totalCountAgg = await Response.aggregate([
            { $match: { survey: survey._id } },
            { $unwind: "$answers" },
            { $match: { "answers.questionId": questionId, "answers.skipped": false } },
            { $count: "total" }
        ]);

        const total = totalCountAgg.length > 0 ? totalCountAgg[0].total : 0;

        res.json({
            success: true,
            data: {
                questionId,
                questionText: question.text,
                type: question.type,
                answers,
                metadata: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getResponseTrends = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { period = '7d', groupBy = 'day' } = req.query;

     // Ensure ownership
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    if (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate = null; // all time

    const matchStage = { survey: survey._id };
    if (startDate) matchStage.createdAt = { $gte: startDate };

    let formatString = "%Y-%m-%d";
    if (groupBy === 'month') formatString = "%Y-%m";
    else if (groupBy === 'week') formatString = "%Y-%U"; // week number

    const trendsAgg = await Response.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { $dateToString: { format: formatString, date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    
    let cumulative = 0;
    const trends = trendsAgg.map(r => {
        cumulative += r.count;
        return {
            date: r._id,
            count: r.count,
            cumulative
        };
    });

    res.json({
        success: true,
        data: { trends }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalSurveys, totalResponsesAgg, byStatus, mostActive] = await Promise.all([
        Survey.countDocuments({ creator: userId }),
        Survey.aggregate([
            { $match: { creator: userId } },
            { $group: { _id: null, total: { $sum: "$stats.totalResponses" } } }
        ]),
        Survey.aggregate([
            { $match: { creator: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Survey.find({ creator: userId }).sort({ 'stats.totalResponses': -1 }).limit(5)
    ]);

    const totalResponses = totalResponsesAgg.length > 0 ? totalResponsesAgg[0].total : 0;
    const avgResponsesPerSurvey = totalSurveys > 0 ? Math.round(totalResponses / totalSurveys) : 0;

    res.json({
        success: true,
        data: {
            totalSurveys,
            totalResponses,
            avgResponsesPerSurvey,
            surveysByStatus: byStatus.map(s => ({ status: s._id, count: s.count })),
            topPerformingSurveys: mostActive.map(s => ({ _id: s._id, title: s.title, responses: s.stats.totalResponses }))
        }
    });

  } catch (error) {
     next(error);
  }
};

const { generateCSV } = require('../utils/csvExport.utils');
const { generatePDF } = require('../utils/pdfExport.utils');

exports.exportCSV = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const responses = await Response.find({ survey: survey._id }).sort({ createdAt: -1 });
    
    const csvString = generateCSV(survey, responses);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey_${survey._id}_export.csv"`);
    
    return res.send(csvString);
  } catch (error) {
    next(error);
  }
};

exports.exportPDF = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || (survey.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const totalResponses = await Response.countDocuments({ survey: survey._id });
    const analyticsData = { overview: { totalResponses, devices: {} } }; 
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="survey_${survey._id}_report.pdf"`);
    
    generatePDF(survey, analyticsData, res);
  } catch (error) {
    next(error);
  }
};
