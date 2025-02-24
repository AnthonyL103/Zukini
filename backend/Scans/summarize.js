const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("⚠️ OpenAI API key is missing. Set REACT_APP_OPENAI_API_KEY in your .env file.");
  process.exit(1);
}

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_RETRIES = 5;


async function summarizeNotes(text, retries = MAX_RETRIES) {
  try {
    const maxTokenEstimate = 4000; // Approximate token limit per request
    const truncatedText = text.length > maxTokenEstimate * 4 ? text.slice(0, maxTokenEstimate * 4) : text;

    const prompt = `
      Summarize the following notes in a concise and structured manner.
      - Use clear and organized bullet points or short paragraphs.
      - Highlight key concepts, definitions, and relationships.
      - Focus on readability and study efficiency.
      - Use bolding when necessary, and avoid using **
      - Include whitespace and new lines for organized structure
      
      Here is an example template to follow: 
      📌 Key Takeaways 
        - The mitochondria are the powerhouse of the cell, generating ATP through cellular respiration.  
        - Photosynthesis occurs in the chloroplasts of plant cells, converting light energy into glucose.  

      🔬 Scientific Concepts  
        - Cellular Respiration: The process where glucose is broken down to produce ATP (energy).  
        - Takes place in the mitochondria.  
        - Involves glycolysis, the Krebs cycle, and the electron transport chain.  
        - Photosynthesis: The process where plants convert sunlight into energy.  
        - Takes place in chloroplasts.  
        - Produces glucose and oxygen as byproducts.  

      🧪 Key Equations  
        - Cellular Respiration:  
        C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP  
        - Photosynthesis:  
        6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂  

      NotesText:
      ${truncatedText}
    `;

    return await sendOpenAiRequest(prompt, "You are an AI assistant that summarizes study notes clearly and concisely.", retries);
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    throw error;
  }
}

async function sendOpenAiRequest(prompt, systemRole, retries) {
  try {
    console.log("📡 Sending request to OpenAI...");

    const response = await axios.post(
      OPENAI_ENDPOINT,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemRole },
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
    console.log(`✅ OpenAI request successful. Remaining requests: ${headers['x-ratelimit-remaining-requests'] || 'unknown'}`);

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.response) {
      const { status, headers } = error.response;

      if (status === 429 && retries > 0) {
        const retryAfterMs = headers['retry-after-ms'] || 3000; // Default 3s retry if no header
        console.warn(`⚠️ Rate limit exceeded. Retrying in ${retryAfterMs / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return sendOpenAiRequest(prompt, systemRole, retries - 1);
      }
    }

    console.error('❌ OpenAI API request failed:', error);
    throw error;
  }
}

module.exports = { summarizeNotes };
