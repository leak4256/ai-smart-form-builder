const { buildSubmissionEmail, buildDistributionEmail } = require('../src/utils/emailTemplates');

describe('email templates', () => {
  it('renders submitted field values into the submission email', () => {
    const html = buildSubmissionEmail({ name: 'ישראל', age: 32 });

    expect(html).toContain('התקבלה תגובה חדשה לטופס שלך!');
    expect(html).toContain('<strong>name:</strong> ישראל');
    expect(html).toContain('<strong>age:</strong> 32');
  });

  it('renders the distribution form link', () => {
    const html = buildDistributionEmail('https://example.com/form');

    expect(html).toContain('קישור לטופס למילוי');
    expect(html).toContain('https://example.com/form');
  });
});
