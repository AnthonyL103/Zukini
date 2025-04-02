const axios = require('axios');
require('dotenv').config();
const { logger } = require('../logging');

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.error({
    type: 'openai_api_key_missing',
    error: 'OpenAI API key is missing in environment variables',
    serviceName: 'createMockTests'
  });
  console.error("⚠️ OpenAI API key is missing. Set REACT_APP_OPENAI_API_KEY in your .env file.");
  process.exit(1);
}

logger.info({
  type: 'openai_api_configured',
  keyPresent: !!OPENAI_API_KEY,
  serviceName: 'createMockTests'
});

async function createMockTests(text, retries = 5) {
  const textLength = text ? text.length : 0;
  
  logger.info({
    type: 'mocktests_generation_attempt',
    textLength,
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
      Generate as many multiple educational test questions as you can (MUST HAVE AT LEAST 4 CHOICES EACH) from NotesText with only one right answer. 
      Ensure that the correct answer is always the first one listed.

      Format:
        question: [Question],
        answer: [Correct Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer],
        question: [Question],
        answer: [Correct Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer],
      
      NotesText:
      ${truncatedText}
    `;

    logger.info({
      type: 'openai_api_request_start',
      promptLength: prompt.length,
      requestType: 'mock_tests'
    });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant that generates text for mock tests.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 7000,
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
    
    const questionCount = (responseContent.match(/question:/gi) || []).length;
    
    logger.info({
      type: 'mocktests_generation_success',
      questionsGenerated: questionCount,
      responseLength: responseContent.length
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
        return createMockTests(text, retries - 1);
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
        type: 'mocktests_generation_error',
        error: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}


async function generatemoreMT(customprompt, scantext, currentquestions, accuracy, retries = 5) {
  const scantextLength = scantext ? scantext.length : 0;
  
  logger.info({
    type: 'generatemoreMT_attempt',
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
      Generate as many educational multiple test questions as you can (MUST HAVE AT LEAST 4 CHOICES EACH) from NotesText with only one right answer
      and make sure they are different than PreviousQuestions. Also make sure to follow the UserRequest as accurately as possible if available.
      Ensure that the correct answer is always the first one listed no matter what.

      Format:
        question: [Question],
        answer: [Correct Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer],
        question: [Question],
        answer: [Correct Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer],
      
      NotesText:
      ${truncatedText}
      
      PreviousQuestions:
      ${currentquestions}

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
          { role: 'system', content: 'You are an assistant that generates text for mock tests.' },
          { role: 'user', content: prompt },
        ],
        temperature: 1 - (accuracy / 100),
        max_tokens: 7000,
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
    
    const questionCount = (responseContent.match(/question:/g) || []).length;
    
    logger.info({
      type: 'mocktest_generation_success',
      questionsGenerated: questionCount,
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
        return generatemoreMT(customprompt, scantext, currentquestions, accuracy, retries - 1);
      }
    } else {
      logger.error({
        type: 'generatemoreMT_error',
        error: error.message,
        stack: error.stack,
        remainingRetries: retries
      });
    }
    
    throw error;
  }
}

async function generatenewMT(scantext, customprompt, accuracy, retries = 5) {
  const scantextLength = scantext ? scantext.length : 0;
  
  logger.info({
    type: 'generatenewMT_attempt',
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
      Generate as many multiple educational test questions as you can (MUST HAVE AT LEAST 4 CHOICES EACH) from NotesText with only one right answer,
      and make sure to follow the UserRequest as accurately as possible if available.
      Ensure that the correct answer is always the first one listed.

      Format:
        question: [Question],
        answer: [Correct Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer],
        question: [Question],
        answer: [Correct Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer]
        answer: [Incorrect Answer],
      
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
          { role: 'system', content: 'You are an assistant that generates text for mock tests.' },
          { role: 'user', content: prompt },
        ],
        temperature: 1 - (accuracy / 100),
        max_tokens: 7000,
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
    
    const questionCount = (responseContent.match(/question:/g) || []).length;
    
    logger.info({
      type: 'mocktest_generation_success',
      questionsGenerated: questionCount,
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
        return generatenewMT(scantext, customprompt, accuracy, retries - 1);
      }
    } else {
      logger.error({
        type: 'generatenewMT_error',  
        error: error.message,
        stack: error.stack,
        remainingRetries: retries
      });
    }
    
    throw error;
  }
}

module.exports = { createMockTests, generatemoreMT, generatenewMT };