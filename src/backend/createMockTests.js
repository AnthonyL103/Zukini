const express = require('express');
const path = require('path');
const cors = require('cors');
const { createMockTests } = require('./parseMockTest');

const app = express();
app.use(express.json());
const port = 5005;

app.use(cors());

app.post('/callparseMockTests', async (req, res) => {
  const { scanname, text, date } = req.body; // Destructure scanname, text, and date
  console.log('Received parameters:', { scanname, text, date });

  if (!text) {
    return res.status(400).json({ error: 'Missing text input' });
  }

  try {
    // Call the parsing function to generate mocktest questions and answers
    const mockTestText = await createMockTests(text);

    // Log the generated questions and answers for debugging
    console.log('Generated mock tests:', mockTestText);

    res.json({
      message: 'Mock test text generated successfully',
      text: mockTestText, // Return the generated mock test content
    });
  } catch (error) {
    console.error('Error generating mock tests:', error);
    res.status(500).json({ error: 'Failed to generate mock tests.' });
  }
});

app.listen(port, () => {
    console.log(`create mock tests server on http://localhost:${port}`);
});