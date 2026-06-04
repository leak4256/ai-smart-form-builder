const { sendFormSubmissionEmail, distributeFormLink } = require('../services/emailService');
const { isValidEmail } = require('../validators/emailValidator');

const submitForm = async (req, res) => {
  const { targetEmail, submittedData } = req.body ?? {};

  if (!targetEmail || !isValidEmail(targetEmail)) {
    return res.status(400).json({ error: 'A valid targetEmail is required' });
  }

  if (!submittedData || typeof submittedData !== 'object' || Array.isArray(submittedData)) {
    return res.status(400).json({ error: 'Submitted form data is required' });
  }

  try {
    await sendFormSubmissionEmail(targetEmail, submittedData);
    return res.json({ success: true });
  } catch (error) {
    console.error('Submit form error:', error);
    return res.status(500).json({ error: 'Failed to send form responses' });
  }
};

const distributeForm = async (req, res) => {
  const { formLink, mailingList } = req.body ?? {};

  if (typeof formLink !== 'string' || !formLink.trim()) {
    return res.status(400).json({ error: 'A non-empty formLink is required' });
  }

  if (!Array.isArray(mailingList) || mailingList.length === 0) {
    return res.status(400).json({ error: 'A non-empty mailingList is required' });
  }

  const normalizedRecipients = mailingList
    .map((email) => (typeof email === 'string' ? email.trim() : email));

  const hasInvalidEmail = normalizedRecipients.some((email) => !isValidEmail(email));
  if (hasInvalidEmail) {
    return res.status(400).json({ error: 'mailingList must contain only valid email addresses' });
  }

  const normalizedFormLink = formLink.trim();

  try {
    const summary = await distributeFormLink(normalizedFormLink, normalizedRecipients);

    if (summary.successCount === 0) {
      return res.status(500).json({ error: 'Failed to distribute form link to all recipients', ...summary });
    }

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Distribute form error:', error);
    return res.status(500).json({
      error: 'Unexpected error while distributing form link',
      successCount: 0,
      failedCount: normalizedRecipients.length,
      failedRecipients: normalizedRecipients
    });
  }
};

module.exports = {
  submitForm,
  distributeForm
};
