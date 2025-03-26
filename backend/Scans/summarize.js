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
      const maxTokenEstimate = 4000; 
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
        Summarize the following notes in **clear and structured text**.

        **Summary Length Constraint:**  
        - Keep the summary **under 500 words**.
        - Focus only on the most important concepts.
        - Omit excessive details and minor explanations.
        - Ensure that all key points remain intact.

        **Formatting Guidelines:**  
        - Organize information with headings, subheadings, and use newlines/indentation.
        - Use bullet points with dashes to break down complex information.
        - Keep the summary concise, structured, and easy to read.
        - Use as many emojis as possible.
        - DO NOT USE ANY SYMBOL OTHER THAN DASHES OR EMOJIS
        
        **Now, summarize the following notes using the guidelines:**  
  ${truncatedText}
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
        max_tokens: 1000,
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