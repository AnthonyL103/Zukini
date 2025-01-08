const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { parseFlashCards } = require('./parseFlashCards');

const fs = require('fs');
const app = express();
app.use(express.json());
const port = 5003;

app.use(cors());

const textJsonPath = path.join(__dirname, '/FlashCardtext.json');

function appendToJsonFile(newEntry) {
    try {
      // Initialize an empty array for JSON data
      let jsonData = [];
  
      // Check if the file exists
      if (fs.existsSync(textJsonPath)) {
        const fileContent = fs.readFileSync(textJsonPath, 'utf8').trim();
        if (fileContent) {
          // If content is not empty, parse it
          jsonData = JSON.parse(fileContent);
        }
      }
  
      // Append the new entry to the array
      jsonData.push(newEntry);
  
      // Write the updated array back to the file
      fs.writeFileSync(textJsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log('New entry appended to text.json');
    } catch (error) {
      console.error('Error appending to JSON file:', error);
    }
  }
  
  
  app.post('/callparseFlashCards', async (req, res) => {
    const { scanname, text, date } = req.body; // Destructure scanname, text, and date
    console.log('Received parameters:', { scanname, text, date });
  
    if (!text) {
      return res.status(400).json({ error: 'Missing text input' });
    }
  
    try {
      // Call the parsing function to generate flashcards
      const flashCardText = await parseFlashCards(text);
  
      // Log the generated flashcards for debugging
      console.log('Generated flashcards:', flashCardText);
  
      res.json({
        message: 'Flashcard text generated successfully',
        text: flashCardText, // Return the generated flashcards
      });
    } catch (error) {
      console.error('Error generating flashcards:', error);
      res.status(500).json({ error: 'Failed to generate flashcards.' });
    }
  });
  
  
  app.post('/saveFlashCards', (req, res) => {
    const { filePath, scanName, FlashCardtext, currDate } = req.body; // Extract variables
  
    if (!filePath || !FlashCardtext) {
      return res.status(400).json({ message: 'filePath and FlashCardtext are required' });
    }
  
    const newEntry = {
      filepath: filePath,
      scanname: scanName,
      text: FlashCardtext,
      date: currDate,
    };
  
    // Append the new entry to the JSON file
    appendToJsonFile(newEntry);
  
    res.json({ message: 'Data saved successfully', newEntry });
  });
  
  
  
  app.listen(port, () => {
    console.log(`create flash card server on http://localhost:${port}`);
  });