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
  
      // Store HTML example separately to prevent backtick issues
      const exampleHTML = `
  <h2>Key Takeaways</h2>
  <ul>
    <li><strong>Mitochondria:</strong> The powerhouse of the cell, generating ATP.</li>
    <li><strong>Photosynthesis:</strong> Occurs in chloroplasts, converting light energy into glucose.</li>
  </ul>
  
  <h2>Scientific Concepts</h2>
  <h3>Cellular Respiration</h3>
  <ul>
    <li><strong>Location:</strong> Mitochondria</li>
    <li><strong>Steps:</strong> Glycolysis → Krebs Cycle → Electron Transport Chain</li>
  </ul>
  
  <h3>Photosynthesis</h3>
  <ul>
    <li><strong>Location:</strong> Chloroplasts</li>
    <li><strong>Products:</strong> Glucose and oxygen</li>
  </ul>
  
  <h2>Key Equations</h2>
  <ul>
    <li><strong>Cellular Respiration:</strong> C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP</li>
    <li><strong>Photosynthesis:</strong> 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂</li>
  </ul>
  
  <h2>Connections & Relationships</h2>
  <ul>
    <li>Photosynthesis produces oxygen and glucose, which are used in cellular respiration.</li>
    <li>Cellular respiration produces CO₂ and water, which are used in photosynthesis.</li>
  </ul>
  `;
  
      // Main prompt
      const prompt = `
  Summarize the following notes in **structured HTML format** for easy readability.  
  
  ✅ **Formatting Guidelines:**  
  - Use <strong> for bold key terms and concepts.  
  - Organize information into **sections with headings** (<h2> and <h3>).  
  - Use <ul> and <li> for bullet points.  
  - Ensure proper spacing and clear structure.  
  
  🎯 **Example Structure (Follow This Format):**  
  ${exampleHTML}
  
  📜 **Now, summarize the following notes using the same structure:**  
  ${truncatedText}
      `;
  
      return await sendOpenAiRequest(prompt, "You are an AI assistant that summarizes study notes clearly and concisely in html format.", retries);
    } catch (error) {
      console.error("Error generating summary:", error);
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
