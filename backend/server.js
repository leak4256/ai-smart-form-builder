const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();
const app = express();

const DEFAULT_ALLOWED_ORIGINS = [
  'https://ai-smart-form-builder-1.onrender.com',
  'http://localhost:5173'
];

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const originAllowList = allowedOrigins.length > 0 ? allowedOrigins : DEFAULT_ALLOWED_ORIGINS;
    if (originAllowList.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

const isValidEmail = (email) => {
  if (typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = ` You are an expert form generator system.
Your job is to take a user description of a form and generate a clean, accurate form schema in JSON format ONLY.
The JSON must strictly follow this structure:
{
  "formTitle": "A descriptive title for the form in Hebrew",
  "fields": [
    {
      "id": "camelCaseUniqueId",
      "type": "text" | "number" | "textarea" | "select" | "file",
      "label": "Field label in Hebrew",
      "required": true or false,
      "placeholder": "An appropriate placeholder in Hebrew"
    }
  ]
}
CRITICAL RULES:
1. If the type is 'select', you MUST add an "options" array inside that field object containing 3-5 appropriate string values in Hebrew.
2. Respond with raw JSON only. No markdown formatting, no \`\`\`json block. Just pure JSON.
3. Keep all text labels, titles, and placeholders in Hebrew.`;

app.post('/api/generate-form', async (req, res) => {
  const { prompt, targetEmail } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!targetEmail || !isValidEmail(targetEmail)) {
    return res.status(400).json({ error: 'A valid targetEmail is required' });
  }

//  res.json({
//     targetEmail: targetEmail.trim(),
//     formTitle: "טופס לדוגמה",
//     fields: [
//   { id: "name", type: "text", label: "שם מלא", required: true, placeholder: "ישראל ישראלי" },
//   { id: "age", type: "number", label: "גיל", required: false, placeholder: "30" }
// ]
//  });
 
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Create a form for: ${prompt}` }
      ],
      response_format: { type: "json_object" } 

    });
    const generatedSchema = JSON.parse(response.choices[0].message.content);
    res.json(generatedSchema);

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate form schema" });
  }
});


const { sendCustomEmail } = require('./helpers/EmailHelper');

app.post('/api/submit-form', async (req, res) => {
  const { targetEmail, submittedData } = req.body ?? {};

  if (!targetEmail || !isValidEmail(targetEmail)) {
    return res.status(400).json({ error: 'A valid targetEmail is required' });
  }

  if (!submittedData || typeof submittedData !== 'object' || Array.isArray(submittedData)) {
    return res.status(400).json({ error: 'Submitted form data is required' });
  }

  try {
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

    await sendCustomEmail(targetEmail.trim(), '🔥 תגובה חדשה מהטופס החכם שלך!', emailContent);
    res.json({ success: true });
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({ error: "Failed to send form responses" });
  }
});

app.post('/api/distribute-form', async (req, res) => {
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
  const emailSubject = 'קישור לטופס למילוי';
  const emailBody = `
    <div dir="rtl" style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
      <h2>קישור לטופס למילוי</h2>
      <p>לחץ/י על הקישור הבא כדי למלא את הטופס:</p>
      <p><a href="${normalizedFormLink}" target="_blank" rel="noopener noreferrer">${normalizedFormLink}</a></p>
    </div>
  `;

  try {
    const distributionResults = await Promise.allSettled(
      normalizedRecipients.map((recipient) => sendCustomEmail(recipient, emailSubject, emailBody))
    );

    const failedRecipients = distributionResults
      .map((result, index) => (result.status === 'rejected' ? normalizedRecipients[index] : null))
      .filter(Boolean);

    const summary = {
      successCount: distributionResults.length - failedRecipients.length,
      failedCount: failedRecipients.length,
      failedRecipients
    };

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
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));