const { openai } = require('../config/openai');
const { SYSTEM_PROMPT } = require('../constants/systemPrompt');

const generateFormSchema = async (prompt) => {
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Create a form for: ${prompt}` }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { generateFormSchema };
