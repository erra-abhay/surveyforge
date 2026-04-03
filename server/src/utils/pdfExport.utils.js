const PDFDocument = require('pdfkit');

exports.generatePDF = (survey, analyticsData, res) => {
  // We stream the PDF directly to the Express Response object
  const doc = new PDFDocument({ margin: 50 });
  
  doc.pipe(res);

  // Header
  doc.fontSize(24).text(`Survey Report: ${survey.title}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  if (survey.description) {
    doc.fontSize(12).text(survey.description);
    doc.moveDown(2);
  }

  // Summary Metrics
  doc.fontSize(18).text('Summary Metrics', { underline: true });
  doc.moveDown();
  doc.fontSize(14).text(`Total Responses: ${analyticsData.overview.totalResponses}`);
  const avgTime = analyticsData.overview.averageCompletionTime ? `${Math.round(analyticsData.overview.averageCompletionTime / 1000)} seconds` : 'N/A';
  doc.text(`Avg. Completion Time: ${avgTime}`);
  doc.moveDown(2);

  // Device Breakdown
  doc.fontSize(18).text('Device Breakdown', { underline: true });
  doc.moveDown();
  Object.entries(analyticsData.overview.devices || {}).forEach(([device, count]) => {
     doc.fontSize(14).text(`- ${device}: ${count}`);
  });
  doc.moveDown(2);

  // Finish
  doc.end();
};
