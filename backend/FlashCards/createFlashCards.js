const express = require('express');
const path = require('path');
const cors = require('cors');
const { parseFlashCards, generatemoreFC, generatenewFC } = require('./parseFlashCards');
const { FlashCardEntries } = require('../Database/db');
const { logger } = require('../logging');
const app = express();
app.use(express.json());
const router = express.Router(); 
const port = 5003;

app.use(cors());

async function appendflashCardToDB(newEntry) {
  logger.info({
    type: 'flashcard_db_append_attempt',
    flashcardKey: newEntry.flashcardkey,
    scanKey: newEntry.scankey,
    userId: newEntry.userid
  });
  
  try {
    await FlashCardEntries.create({
      flashcardkey: newEntry.flashcardkey,
      filepath: newEntry.filepath,
      scanname: newEntry.scanname,
      flashcards: newEntry.flashcards,
      fcsessionname: newEntry.fcsessionname,
      date: newEntry.date,
      scankey: newEntry.scankey,
      userid: newEntry.userid,
    });

    logger.info({
      type: 'flashcard_db_append_success',
      flashcardKey: newEntry.flashcardkey,
      userId: newEntry.userid
    });
  } catch (error) {
    logger.error({
      type: 'flashcard_db_append_error',
      flashcardKey: newEntry.flashcardkey,
      userId: newEntry.userid,
      error: error.message,
      stack: error.stack
    });
  }
}

router.post('/callregenerateFlashcards', async (req, res) => {
  const {customprompt, scantext, generatemore, currentflashcards, accuracy} = req.body;
  logger.info({
    type: 'regenerate_flashcards_attempt',
    customprompt: customprompt,
    generatemore: generatemore,
    accuracy: accuracy
  });

  if (generatemore) {
    try {
      const flashCardText = await generatemoreFC(customprompt, scantext, currentflashcards, accuracy);
      const questionCount = (flashCardText.match(/Question:/g) || []).length;
      
      logger.info({
        type: 'regenerate_flashcards_success',
        generatemore: generatemore,
        cardsGenerated: questionCount
      });
  
      res.json({
        message: 'More Flashcard text generated successfully',
        text: flashCardText, 
      });
    } catch (error) {
      logger.error({
        type: 'regenerate_flashcards_error',
        generatemore: generatemore,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to generate more flashcards.' });
    }
  } else {
    try {
      const flashCardText = await generatenewFC(scantext, customprompt, accuracy);
      const questionCount = (flashCardText.match(/Question:/g) || []).length;
      
      logger.info({
        type: 'regenerate_flashcards_success',
        generatemore: generatemore,
        cardsGenerated: questionCount
      });
  
      res.json({
        message: 'New Flashcard text generated successfully',
        text: flashCardText, 
      });
    } catch (error) {
      logger.error({
        type: 'regenerate_flashcards_error',
        generatemore: generatemore,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to generate new flashcards.' });
    }
  }
});
  
router.post('/callparseFlashCards', async (req, res) => {
  const { scanname, text, date } = req.body;
  
  logger.info({
    type: 'parse_flashcards_attempt',
    scanName: scanname,
    date: date,
    textLength: text ? text.length : 0
  });

  if (!text) {
    logger.warn({
      type: 'parse_flashcards_failure',
      reason: 'missing_text',
      scanName: scanname
    });
    return res.status(400).json({ error: 'Missing text input' });
  }

  try {
    const flashCardText = await parseFlashCards(text);
    const questionCount = (flashCardText.match(/Question:/g) || []).length;
    logger.info({
      type: 'parse_flashcards_success',
      scanName: scanname,
      cardsGenerated: questionCount
    });

    res.json({
      message: 'Flashcard text generated successfully',
      text: flashCardText, 
    });
  } catch (error) {
    logger.error({
      type: 'parse_flashcards_error',
      scanName: scanname,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to generate flashcards.' });
  }
});


router.post('/saveFlashCards', async (req, res) => {
  const { flashcardkey, filepath, scanname, flashcards, fcsessionname, date, scankey, userid } = req.body;
  
  logger.info({
    type: 'save_flashcards_attempt',
    flashcardKey: flashcardkey,
    scanKey: scankey,
    userId: userid
  });

  if (!filepath || !flashcards) {
    logger.warn({
      type: 'save_flashcards_failure',
      reason: 'missing_required_fields',
      userId: userid,
      hasFilepath: !!filepath,
      hasFlashcards: !!flashcards
    });
    return res.status(400).json({ message: 'filePath and FlashCardtext are required' });
  }

  const newEntry = {
    flashcardkey: flashcardkey,
    filepath: filepath,
    scanname: scanname,
    flashcards: flashcards,
    fcsessionname: fcsessionname,
    date: date,
    scankey: scankey,
    userid: userid,
  };
  
  try {
    await appendflashCardToDB(newEntry);
    
    logger.info({
      type: 'save_flashcards_success',
      flashcardKey: flashcardkey,
      scanKey: scankey,
      userId: userid
    });
    
    res.json({ message: 'FlashCards saved successfully', newEntry });
  } catch (error) {
    logger.error({
      type: 'save_flashcards_error',
      flashcardKey: flashcardkey,
      userId: userid,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ message: 'Failed to save FlashCards to the database ' });
  }
});




app.use('/flashcards', router);

app.listen(port, '0.0.0.0', () => {
  logger.info({
    type: 'server_start',
    service: 'flashcards_service',
    port: port,
    timestamp: new Date().toISOString()
  });
  console.log(`create flash card server on ${port}`);
});