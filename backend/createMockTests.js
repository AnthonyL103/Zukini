const express = require('express');
const cors = require('cors');
const { createMockTests } = require('./parseMockTest');
const { MockTestEntries } = require('./db');
const app = express();
app.use(express.json());
const port = 5005;

app.use(cors());

async function appendmocktestToDB(newEntry) {
    try {
      // Insert the new entry into the database
      await MockTestEntries.create({
        mocktestkey: newEntry.mocktestkey,
        filepath: newEntry.filepath,
        scanname: newEntry.scanname,
        questions: newEntry.questions,
        date: newEntry.date,
        userid: newEntry.userid,
      });
  
      console.log('New mocktest entry appended to the database');
    } catch (error) {
      console.error('Error appending to the database:', error);
    }
  }

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

app.post('/saveMockTest', async (req, res) => {
    const { mocktestkey, filePath, scanName, questionstext, currDate, userId } = req.body; // Extract variables
  
    if (!filePath || !questionstext) {
      return res.status(400).json({ message: 'filePath and FlashCardtext are required' });
    }
  
    const newEntry = {
      mocktestkey: mocktestkey,
      filepath: filePath,
      scanname: scanName,
      questions: questionstext,
      date: currDate,
      userid: userId,
    };
    
    try {
      await appendmocktestToDB(newEntry);
      
    } catch (error) {
      console.error('Error saving mocktest:', error);
      return res.status(500).json({ message: 'Failed to save mocktest to the database ' });
    }
    // Append the new entry to the JSON file
    
  
    res.json({ message: 'mocktest saved successfully', newEntry });
  });

app.listen(port, '0.0.0.0', () => {
    console.log(`create mock tests server on ${port}`);
});