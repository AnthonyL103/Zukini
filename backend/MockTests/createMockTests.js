const express = require('express');
const cors = require('cors');
const { createMockTests } = require('./parseMockTest');
const { MockTestEntries } = require('../Database/db');
const app = express();
app.use(express.json());
const router = express.Router(); 
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
        mtsessionname: newEntry.mtsessionname,
        date: newEntry.date,
        scankey: newEntry.scankey,
        userid: newEntry.userid,
      });
  
      console.log('New mocktest entry appended to the database');
    } catch (error) {
      console.error('Error appending to the database:', error);
    }
  }

router.post('/callparseMockTests', async (req, res) => {
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

// In your backend (e.g., Express.js)
router.post('/updateMockTest', async (req, res) => {
  try {
    const { mocktestkey, filepath, scanname, questions, mtsessionname, date, scankey, userid } = req.body; // Extract variables


    if (!mocktestkey || !userid || !questions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Delete the old mock test
    await db.collection('mocktests').deleteOne({ mocktestkey, scankey, userid });

    // Insert the updated mock test
    const newMockTest = {
      mocktestkey: mocktestkey, 
      userid,
      questions,
      scanname,
      date,
      filepath,
      mtsessionname
    };

    await db.collection('mocktests').insertOne(newMockTest);

    res.status(200).json({ message: 'Mock test updated successfully' });
  } catch (error) {
    console.error('Error updating mock test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/saveMockTest', async (req, res) => {
    const { mocktestkey, filepath, scanname, questions, mtsessionname, date, scankey, userid } = req.body; // Extract variables
  
    if (!filepath || !questions) {
      return res.status(400).json({ message: 'filePath and FlashCardtext are required' });
    }
  
    const newEntry = {
      mocktestkey: mocktestkey,
      filepath: filepath,
      scanname: scanname,
      questions: questions,
      mtsessionname: mtsessionname,
      date: date,
      scankey: scankey,
      userid: userid,
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
  
app.use('/mocktests', router);


app.listen(port, '0.0.0.0', () => {
    console.log(`create mock tests server on ${port}`);
});