const { generateFormSchema } = require('../services/formService');
const { isValidEmail } = require('../validators/emailValidator');

const generateForm = async (req, res) => {
  const { prompt, targetEmail } = req.body ?? {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!targetEmail || !isValidEmail(targetEmail)) {
    return res.status(400).json({ error: 'A valid targetEmail is required' });
  }

  try {
    const generatedSchema = await generateFormSchema(prompt);
    return res.json(generatedSchema);
  } catch (error) {
    console.error('OpenAI Error:', error);
    return res.status(500).json({ error: 'Failed to generate form schema' });
  }
};

module.exports = { generateForm };
