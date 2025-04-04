const axios = require('axios');
require('dotenv').config();
const { logger } = require('../logging');

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.error({
    type: 'openai_api_key_missing',
    error: 'OpenAI API key is missing in environment variables',
    serviceName: 'summarizeNotes'
  });
  console.error("⚠️ OpenAI API key is missing. Set REACT_APP_OPENAI_API_KEY in your .env file.");
  process.exit(1);
}

logger.info({
  type: 'openai_api_configured',
  keyPresent: !!OPENAI_API_KEY,
  serviceName: 'summarizeNotes'
});

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_RETRIES = 5;

async function summarizeNotes(text, retries = MAX_RETRIES) {
    const textLength = text ? text.length : 0;
    
    logger.info({
        type: 'summarize_notes_attempt',
        textLength: textLength,
        retriesRemaining: retries,
        modelName: 'gpt-4o-mini'
    });
    
    try {
      const maxTokenEstimate = 5000; 
      const truncatedText = text.length > maxTokenEstimate * 4 ? text.slice(0, maxTokenEstimate * 4) : text;
      const wasTruncated = text.length !== truncatedText.length;
      
      if (wasTruncated) {
        logger.info({
            type: 'text_truncated',
            originalLength: text.length,
            truncatedLength: truncatedText.length,
            maxTokenEstimate
        });
      }
      
      const prompt = `
      You are tasked with summarizing a given text into a well-formatted HTML document that enhances readability and user experience. The summary should be no longer than 500 words and should focus on the key points of the text, ensuring the following formatting guidelines are met:
      
      1. **Title Formatting:**
        - Use larger fonts for titles to make them stand out.
        - Example: \`<h1 style="font-size: 24px; color: #2C3E50;">Title</h1>\`

      2. **Key Points:**
        - Highlight key points by using different colors or bold text.
        - Example: \`<p style="color: #E74C3C; font-weight: bold;">This is a key point.</p>\`

      3. **Bullet Points:**
        - Use bullet points to list important items or steps in a process.
        - Example: \`<ul><li>First important item.</li><li>Second important item.</li></ul>\`

      4. **Section Headings:**
        - Make section headings clear and distinguishable.
        - Example: \`<h2 style="font-size: 20px; color: #3498DB;">Section Heading</h2>\`

      5. **Text Formatting:**
        - Use different colors to differentiate between sections or points to improve user experience.
        - Example: \`<p style="color: #34495E;">General text in the summary.</p>\`

      6. **Overall Styling:**
        - Ensure the HTML document is visually appealing and easy to read.
        - Example: \`<div style="font-family: Arial, sans-serif; line-height: 1.6;">\`

      Here is an example input and output:

      ### Input Text:
      ${truncatedText}

      ### Output HTML:
      \`\`\`
      <h1 style="font-size: 24px; color: #2C3E50;">Title of the Summary</h1>
      <p style="color: #34495E;">Text introduction and general information...</p>
      <h2 style="font-size: 20px; color: #3498DB;">Key Points</h2>
      <p style="color: #E74C3C; font-weight: bold;">First key point.</p>
      <p style="color: #E74C3C; font-weight: bold;">Second key point.</p>
      <ul><li>Important item one</li><li>Important item two</li></ul>
      <h2 style="font-size: 20px; color: #3498DB;">Conclusion</h2>
      <p style="color: #34495E;">Final thoughts and summary...</p>
      </div>
      \`\`\`

      Ensure the summary is informative, concise, and structured for optimal user experience.
   `;

      const systemRole = "You are an AI assistant that summarizes study notes clearly and concisely";
      
      logger.info({
        type: 'summarization_request_start',
        promptLength: prompt.length,
        systemRole: systemRole
      });

      const result = await sendOpenAiRequest(prompt, systemRole, retries);

      logger.info({
        type: 'summarize_notes_success',
        inputLength: text.length,
        outputLength: result.length
      });
      
      return result;
    } catch (error) {
      logger.error({
        type: 'summarize_notes_error',
        error: error.message,
        stack: error.stack,
        textLength: text.length
      });
      throw error;
    }
}

async function sendOpenAiRequest(prompt, systemRole, retries) {
  logger.info({
    type: 'openai_api_request_attempt',
    promptLength: prompt.length,
    systemRole: systemRole,
    retriesRemaining: retries
  });
  
  try {
    const response = await axios.post(
      OPENAI_ENDPOINT,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemRole },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 5000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const headers = response.headers;
    const remainingRequests = headers['x-ratelimit-remaining-requests'] || 'unknown';
    const responseContent = response.data.choices[0].message.content.trim();
    
    logger.info({
      type: 'openai_api_request_success',
      remainingRequests: remainingRequests,
      responseLength: responseContent.length,
      statusCode: response.status,
      model: 'gpt-4o-mini'
    });
    
    return responseContent;
  } catch (error) {
    if (error.response) {
      const { status, headers, data } = error.response;
      
      if (status === 429 && retries > 0) {
        const retryAfterMs = headers['retry-after-ms'] || 3000; 
        
        logger.warn({
          type: 'rate_limit_reached',
          statusCode: status,
          retryDelayMs: retryAfterMs,
          retriesRemaining: retries - 1,
          errorMessage: data?.error?.message || 'Rate limit exceeded'
        });
        
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return sendOpenAiRequest(prompt, systemRole, retries - 1);
      } else {
        logger.error({
          type: 'openai_api_error',
          statusCode: status,
          errorMessage: data?.error?.message || 'Unknown API error',
          retriesRemaining: retries
        });
      }
    } else {
      logger.error({
        type: 'openai_api_request_error',
        error: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

module.exports = { summarizeNotes };