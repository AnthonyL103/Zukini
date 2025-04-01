const axios = require('axios');
require('dotenv').config();
const { logger } = require('../logging');

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.error({
    type: 'openai_api_key_missing',
    error: 'OpenAI API key is missing in environment variables',
    serviceName: 'parseFlashCards'
  });
  console.error("⚠️ OpenAI API key is missing. Set REACT_APP_OPENAI_API_KEY in your .env file.");
  process.exit(1);
}

logger.info({
  type: 'openai_api_configured',
  keyPresent: !!OPENAI_API_KEY,
  serviceName: 'parseFlashCards'
});

async function parseFlashCards(text, retries = 5) {
  const textLength = text ? text.length : 0;
  
  logger.info({
    type: 'flashcards_generation_attempt',
    textLength,
    retries,
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
      Generate as many educational flashcards as you can from Notestext. Use this format and create as many as you can:
        Question: [Question],
        Answer: [Answer],
        Question: [Question],
        Answer: [Answer]

      NotesText:
      ${truncatedText}
    `;

    logger.info({
      type: 'openai_api_request_start',
      promptLength: prompt.length
    });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant that generates text for flashcards.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
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
    const remainingRequests = headers['x-ratelimit-remaining-requests'];
    const responseContent = response.data.choices[0].message.content.trim();
    
    logger.info({
      type: 'openai_api_request_success',
      remainingRequests: remainingRequests,
      responseLength: responseContent.length,
      statusCode: response.status,
      model: 'gpt-4o-mini'
    });
    
    const questionCount = (responseContent.match(/Question:/g) || []).length;
    
    logger.info({
      type: 'flashcards_generation_success',
      flashcardsGenerated: questionCount,
      responseLength: responseContent.length
    });
    
    return responseContent;

  } catch (error) {
    if (error.response) {
      const { status, headers, data } = error.response;
      
      logger.error({
        type: 'openai_api_request_error',
        statusCode: status,
        errorMessage: data?.error?.message || 'Unknown API error',
        retryAfter: headers['retry-after'] || headers['retry-after-ms'],
        remainingRetries: retries,
        error: error.message
      });
      
      if (status === 429 && retries > 0) {
        const retryAfterMs = headers['retry-after-ms'] || 3000; 
        
        logger.info({
          type: 'rate_limit_retry',
          retryDelayMs: retryAfterMs,
          remainingRetries: retries - 1
        });
        
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return parseFlashCards(text, retries - 1);
      }
    } else {
      logger.error({
        type: 'flashcards_generation_error',
        error: error.message,
        stack: error.stack,
        remainingRetries: retries
      });
    }
    
    throw error;
  }
}


async function generatemoreFC(customprompt, scantext, currentflashcards, accuracy, retries = 5) {
  const scantextLength = scantext ? scantext.length : 0;
  
  logger.info({
    type: 'generatemoreFC_attempt',
    scantextLength,
    retries,
    modelName: 'gpt-4o-mini'
  });
  
  try {
    const maxTokenEstimate = 5000; 
    const truncatedText = scantext.length > maxTokenEstimate * 4 ? scantext.slice(0, maxTokenEstimate * 4) : scantext;
    const wasTruncated = scantext.length !== truncatedText.length;
    
    if (wasTruncated) {
      logger.info({
        type: 'text_truncated',
        originalLength: scantext.length,
        truncatedLength: truncatedText.length,
        maxTokenEstimate
      });
    }

    const prompt = `
      Generate more educational flashcards based on NoteText, and make sure they are different than PreviousFlashcards. Also make sure to follow the UserRequest as accurately as possible if available.
      Use this format and create as many as you can:
        Question: [Question],
        Answer: [Answer],
        Question: [Question],
        Answer: [Answer]

      NotesText:
      ${truncatedText}
      PreviousFlashcards:
      ${currentflashcards}
      UserRequest:
      ${customprompt}
    `;

    logger.info({
      type: 'openai_api_request_start',
      promptLength: prompt.length
    });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant that generates text for flashcards.' },
          { role: 'user', content: prompt },
        ],
        temperature: 1 - (accuracy / 100),
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
    const remainingRequests = headers['x-ratelimit-remaining-requests'];
    const responseContent = response.data.choices[0].message.content.trim();
    
    logger.info({
      type: 'openai_api_request_success',
      remainingRequests: remainingRequests,
      responseLength: responseContent.length,
      statusCode: response.status,
      model: 'gpt-4o-mini'
    });
    
    const questionCount = (responseContent.match(/Question:/g) || []).length;
    
    logger.info({
      type: 'flashcards_generation_success',
      flashcardsGenerated: questionCount,
      responseLength: responseContent.length
    });
    
    return responseContent;

  } catch (error) {
    if (error.response) {
      const { status, headers, data } = error.response;
      
      logger.error({
        type: 'openai_api_request_error',
        statusCode: status,
        errorMessage: data?.error?.message || 'Unknown API error',
        retryAfter: headers['retry-after'] || headers['retry-after-ms'],
        remainingRetries: retries,
        error: error.message
      });
      
      if (status === 429 && retries > 0) {
        const retryAfterMs = headers['retry-after-ms'] || 3000; 
        
        logger.info({
          type: 'rate_limit_retry',
          retryDelayMs: retryAfterMs,
          remainingRetries: retries - 1
        });
        
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return generatemoreFC(customprompt, scantext, currentflashcards, accuracy, retries - 1);
      }
    } else {
      logger.error({
        type: 'generatemoreFC_error',
        error: error.message,
        stack: error.stack,
        remainingRetries: retries
      });
    }
    
    throw error;
  }
}

async function generatenewFC(scantext, customprompt, accuracy, retries = 5) {
  const scantextLength = scantext ? scantext.length : 0;
  
  logger.info({
    type: 'generatenewFC_attempt',
    scantextLength,
    retries,
    modelName: 'gpt-4o-mini'
  });
  
  try {
    const maxTokenEstimate = 5000; 
    const truncatedText = scantext.length > maxTokenEstimate * 4 ? scantext.slice(0, maxTokenEstimate * 4) : scantext;
    const wasTruncated = scantext.length !== truncatedText.length;
    
    if (wasTruncated) {
      logger.info({
        type: 'text_truncated',
        originalLength: scantext.length,
        truncatedLength: truncatedText.length,
        maxTokenEstimate
      });
    }

    const prompt = `
      Generate as many educational flashcards based on NoteText, and make sure to follow the UserRequest as accurately as possible if available.
      Use this format and create as many as you can:
        Question: [Question],
        Answer: [Answer],
        Question: [Question],
        Answer: [Answer]

      NotesText:
      ${truncatedText}
      UserRequest:
      ${customprompt}
    `;

    logger.info({
      type: 'openai_api_request_start',
      promptLength: prompt.length
    });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant that generates text for flashcards.' },
          { role: 'user', content: prompt },
        ],
        temperature: 1 - (accuracy / 100),
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
    const remainingRequests = headers['x-ratelimit-remaining-requests'];
    const responseContent = response.data.choices[0].message.content.trim();
    
    logger.info({
      type: 'openai_api_request_success',
      remainingRequests: remainingRequests,
      responseLength: responseContent.length,
      statusCode: response.status,
      model: 'gpt-4o-mini'
    });
    
    const questionCount = (responseContent.match(/Question:/g) || []).length;
    
    logger.info({
      type: 'flashcards_generation_success',
      flashcardsGenerated: questionCount,
      responseLength: responseContent.length
    });
    
    return responseContent;

  } catch (error) {
    if (error.response) {
      const { status, headers, data } = error.response;
      
      logger.error({
        type: 'openai_api_request_error',
        statusCode: status,
        errorMessage: data?.error?.message || 'Unknown API error',
        retryAfter: headers['retry-after'] || headers['retry-after-ms'],
        remainingRetries: retries,
        error: error.message
      });
      
      if (status === 429 && retries > 0) {
        const retryAfterMs = headers['retry-after-ms'] || 3000; 
        
        logger.info({
          type: 'rate_limit_retry',
          retryDelayMs: retryAfterMs,
          remainingRetries: retries - 1
        });
        
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return generatenewFC(scantext, customprompt, accuracy, retries - 1);
      }
    } else {
      logger.error({
        type: 'generatenewFC_error',  
        error: error.message,
        stack: error.stack,
        remainingRetries: retries
      });
    }
    
    throw error;
  }
}
module.exports = { parseFlashCards, generatemoreFC, generatenewFC };