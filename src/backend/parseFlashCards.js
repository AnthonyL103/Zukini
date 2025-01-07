const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 3000; // Default to 3000 if no PORT environment variable
const app = express();

// Load environment variables (if using dotenv for the OpenAI API key)
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function parseFlashCards(text) {
  try {
    // Define the prompt
    const prompt = `
      Generate educational flashcards from the following text. Use this format:
      - Question: [Question]
        Answer: [Answer]

      Text:
      ${text}
    `;

    // Send a request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an assistant that generates flashcards.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

// Start the Express server
app.listen(port, () => {
  console.log(`Flashcard parsing server running on http://localhost:${port}`);
});
