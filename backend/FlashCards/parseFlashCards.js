const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("⚠️ OpenAI API key is missing. Set REACT_APP_OPENAI_API_KEY in your .env file.");
  process.exit(1);
}

console.log("Using OpenAI API Key:", OPENAI_API_KEY);

async function parseFlashCards(text, retries = 5) {
  try {
    // Limit text to avoid exceeding OpenAI's token limit
    const maxTokenEstimate = 4000; // Rough token limit per request
    const truncatedText = text.length > maxTokenEstimate * 4 ? text.slice(0, maxTokenEstimate * 4) : text;

    // Define the prompt
    const prompt = `
      Generate educational flashcards from Notestext. Use this format and create as many as you can:
        Question: [Question],
        Answer: [Answer],
        Question: [Question],
        Answer: [Answer]

      NotesText:
      ${truncatedText}
    `;

    console.log("📡 Sending request to OpenAI...");

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant that generates text for flashcards.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Log rate limit headers
    const headers = response.headers;
    console.log(`✅ Flashcards generated. Remaining requests: ${headers['x-ratelimit-remaining-requests']}`);
    
    return response.data.choices[0].message.content.trim();

  } catch (error) {
    if (error.response) {
      const { status, headers } = error.response;
      
      if (status === 429 && retries > 0) {
        const retryAfterMs = headers['retry-after-ms'] || 3000; // Default 3s retry if no header
        console.warn(`⚠️ Rate limit exceeded. Retrying in ${retryAfterMs / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return parseFlashCards(text, retries - 1);
      }
    }
    
    console.error('❌ Error during flashcard generation:', error);
    throw error;
  }
}

module.exports = { parseFlashCards };
