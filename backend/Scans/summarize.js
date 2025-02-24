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
  
      // Main prompt
      const prompt = `
  Summarize the following notes in **structured HTML format** for easy readability.  
  
  **Formatting Guidelines:**  
  - Emphasize key terms and concepts using <strong> to make important points stand out.
  - Structure information clearly by dividing it into sections with appropriate headings (<h2> for major topics, <h3> for subtopics).
  - Enhance readability by using page breaks (<hr>) and newlines (<br>) where necessary to separate different sections.
  - Use lists (<ul> and <li>) to break down complex information into digestible points.
  - Do not include anything outside of HTML—ensure the output consists only of properly structured HTML content.
  - Incorporate colors to create a vibrant, engaging study experience:
  - Use bold colors for headings (e.g., <h2 style="color:#2C3E50;"> for a deep blue).
  - Highlight key definitions and terms with a subtle background color (e.g., <span style="background-color:#FFFF99;"> for yellow highlights).
  - Make important equations and formulas stand out using a different color or font style (e.g., <p style="color:#E74C3C; font-weight:bold;">).
  - Ensure proper spacing and alignment so that the summary is visually clear and easy to skim.
  - Keep the formatting consistent throughout the summary for a professional and structured look.
  
  
  
  **Now, summarize the following notes using the guidelines:**  
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
