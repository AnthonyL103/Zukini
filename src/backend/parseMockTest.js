const axios = require('axios');

require('dotenv').config();
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

async function createMockTests(text) {
    try {
        const prompt = `
        Generate mock test questions (question, response format or muliple choice format) and answers from NotesText. Use this format:
            question: [Question],
            answer: [Answer],
            question: [Question],
            answer: [Answer]
        
        NotesText:
        ${text}
    `;
    
    console.log("made call")
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are an assistant that generates text for mock tests.' },
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
    const mockTests = response.data.choices[0].message.content.trim();
    return mockTests

    } catch (error) {
        console.error('Error during mock test generation:', error);
        throw error;
    }
}

module.exports = { createMockTests };
    