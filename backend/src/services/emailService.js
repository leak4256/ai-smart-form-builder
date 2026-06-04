const { transporter } = require('../config/email');
const { buildSubmissionEmail, buildDistributionEmail } = require('../utils/emailTemplates');

const sendCustomEmail = async (to, subject, htmlContent) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent
  });
};

const sendFormSubmissionEmail = async (targetEmail, submittedData) => {
  const htmlContent = buildSubmissionEmail(submittedData);
  await sendCustomEmail(targetEmail.trim(), '🔥 תגובה חדשה מהטופס החכם שלך!', htmlContent);
};

const distributeFormLink = async (formLink, mailingList) => {
  const emailSubject = 'קישור לטופס למילוי';
  const emailBody = buildDistributionEmail(formLink);

  const distributionResults = await Promise.allSettled(
    mailingList.map((recipient) => sendCustomEmail(recipient, emailSubject, emailBody))
  );

  const failedRecipients = distributionResults
    .map((result, index) => (result.status === 'rejected' ? mailingList[index] : null))
    .filter(Boolean);

  return {
    successCount: distributionResults.length - failedRecipients.length,
    failedCount: failedRecipients.length,
    failedRecipients
  };
};

module.exports = {
  sendCustomEmail,
  sendFormSubmissionEmail,
  distributeFormLink
};
