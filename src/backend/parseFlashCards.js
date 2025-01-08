const axios = require('axios');
// Load environment variables (if using dotenv for the OpenAI API key)
//require('dotenv').config({ path: './apikey.env' });
const OPENAI_API_KEY = "";
async function parseFlashCards(text) {
  try {
    console.log('Using OpenAI API Key:', OPENAI_API_KEY ? 'Key Loaded' : 'Key Missing');
    // Define the prompt
    const prompt = `
      Generate educational flashcards from Notestext. Use this format:
        Question: [Question],
        Answer: [Answer],
        Question: [Question],
        Answer: [Answer]
        
      NotesText:
      ${text}
    `;

    // Send a request to OpenAI API
    console.log("made call")
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
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

    // Parse the API response
    const flashcards = response.data.choices[0].message.content.trim();
    return flashcards;

  } catch (error) {
    console.error('Error during flashcard generation:', error);
    throw error;
  }
}

module.exports = { parseFlashCards };
