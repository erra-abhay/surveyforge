const { Parser } = require('json2csv');

exports.generateCSV = (survey, responses) => {
  // Extract all unique question IDs or Titles
  const questionMap = {};
  survey.questions.forEach(q => {
    questionMap[q._id.toString()] = q.title;
  });

  const formattedData = responses.map(r => {
    const row = {
      ResponseId: r._id.toString(),
      SubmittedAt: r.createdAt.toISOString(),
      RespondentIP: r.metadata?.ipAddress || 'unknown',
      Platform: r.metadata?.userAgent || 'unknown',
    };

    // Flatten answers
    r.answers.forEach(ans => {
      const qTitle = questionMap[ans.questionId.toString()] || ans.questionId;
      row[qTitle] = ans.value;
    });

    return row;
  });

  if (formattedData.length === 0) {
    return 'No responses available for export.';
  }

  const json2csvParser = new Parser();
  return json2csvParser.parse(formattedData);
};
