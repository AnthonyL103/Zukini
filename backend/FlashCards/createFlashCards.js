const express = require('express');
const path = require('path');
const cors = require('cors');
const { parseFlashCards } = require('./parseFlashCards');
const { FlashCardEntries } = require('../Database/db');
const app = express();
app.use(express.json());
const router = express.Router(); 
const port = 5003;

app.use(cors());

async function appendflashCardToDB(newEntry) {
  try {
    // Insert the new entry into the database
    await FlashCardEntries.create({
      flashcardkey: newEntry.flashcardkey,
      filepath: newEntry.filepath,
      scanname: newEntry.scanname,
      flashcards: newEntry.flashcardtext,
      fcsessionname: newEntry.fcsessionname,
      date: newEntry.date,
      userid: newEntry.userid,
    });

    console.log('New flashcard entry appended to the database');
  } catch (error) {
    console.error('Error appending to the database:', error);
  }
}
  
router.post('/callparseFlashCards', async (req, res) => {
  const { scanname, text, date } = req.body; 
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


router.post('/saveFlashCards', async (req, res) => {
  const { flashcardkey, filePath, scanName, FlashCardtext, FCsession, currDate, userId } = req.body; // Extract variables

  if (!filePath || !FlashCardtext) {
    return res.status(400).json({ message: 'filePath and FlashCardtext are required' });
  }

  const newEntry = {
    flashcardkey: flashcardkey,
    filepath: filePath,
    scanname: scanName,
    flashcardtext: FlashCardtext,
    fcsessionname: FCsession,
    date: currDate,
    userid: userId,
  };
  
  try {
    await appendflashCardToDB(newEntry);
    
  } catch (error) {
    console.error('Error saving FlashCards:', error);
    return res.status(500).json({ message: 'Failed to save FlashCards to the database ' });
  }
  // Append the new entry to the JSON file
  

  res.json({ message: 'FlashCards saved successfully', newEntry });
});


app.use('/flashcards', router);

app.listen(port, '0.0.0.0',() => {
  console.log(`create flash card server on ${port}`);
});