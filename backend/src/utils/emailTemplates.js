const buildSubmissionEmail = (submittedData) => {
  let emailContent = `
    <div dir="rtl" style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
      <h2>התקבלה תגובה חדשה לטופס שלך!</h2>
      <ul>
  `;

  for (const [key, value] of Object.entries(submittedData)) {
    emailContent += `<li><strong>${key}:</strong> ${String(value ?? '')}</li>`;
  }

  emailContent += `
      </ul>
    </div>
  `;

  return emailContent;
};

const buildDistributionEmail = (formLink) => `
  <div dir="rtl" style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
    <h2>קישור לטופס למילוי</h2>
    <p>לחץ/י על הקישור הבא כדי למלא את הטופס:</p>
    <p><a href="${formLink}" target="_blank" rel="noopener noreferrer">${formLink}</a></p>
  </div>
`;

module.exports = {
  buildSubmissionEmail,
  buildDistributionEmail
};
