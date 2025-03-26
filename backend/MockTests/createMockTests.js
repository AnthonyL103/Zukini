const express = require('express');
const cors = require('cors');
const { createMockTests } = require('./parseMockTest');
const { MockTestEntries } = require('../Database/db');
const { logger } = require('../logging');
const app = express();
app.use(express.json());
const router = express.Router(); 
const port = 5005;

app.use(cors());

async function appendmocktestToDB(newEntry) {
    logger.info({
        type: 'mocktest_db_append_attempt',
        mocktestKey: newEntry.mocktestkey,
        scanKey: newEntry.scankey,
        userId: newEntry.userid
    });
    
    try {
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
  
      logger.info({
        type: 'mocktest_db_append_success',
        mocktestKey: newEntry.mocktestkey,
        userId: newEntry.userid
      });
    } catch (error) {
      logger.error({
        type: 'mocktest_db_append_error',
        mocktestKey: newEntry.mocktestkey,
        userId: newEntry.userid,
        error: error.message,
        stack: error.stack
      });
    }
}

router.post('/callparseMockTests', async (req, res) => {
  const { scanname, text, date } = req.body;
  
  logger.info({
    type: 'parse_mocktests_attempt',
    scanName: scanname,
    date: date,
    textLength: text ? text.length : 0
  });

  if (!text) {
    logger.warn({
      type: 'parse_mocktests_failure',
      reason: 'missing_text',
      scanName: scanname
    });
    return res.status(400).json({ error: 'Missing text input' });
  }

  try {
    const mockTestText = await createMockTests(text);

    logger.info({
      type: 'parse_mocktests_success',
      scanName: scanname,
      questionsGenerated: Array.isArray(mockTestText) ? mockTestText.length : 1
    });

    res.json({
      message: 'Mock test text generated successfully',
      text: mockTestText,
    });
  } catch (error) {
    logger.error({
      type: 'parse_mocktests_error',
      scanName: scanname,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to generate mock tests.' });
  }
});

router.post('/updateMockTest', async (req, res) => {
  const { mocktestkey, filepath, scanname, questions, mtsessionname, date, scankey, userid } = req.body;
  
  logger.info({
    type: 'update_mocktest_attempt',
    mocktestKey: mocktestkey,
    scanKey: scankey,
    userId: userid
  });

  if (!mocktestkey || !userid || !questions) {
    logger.warn({
      type: 'update_mocktest_failure',
      reason: 'missing_required_fields',
      hasKey: !!mocktestkey,
      hasUserId: !!userid,
      hasQuestions: !!questions
    });
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.collection('mocktests').deleteOne({ mocktestkey, scankey, userid });

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

    logger.info({
      type: 'update_mocktest_success',
      mocktestKey: mocktestkey,
      userId: userid
    });

    res.status(200).json({ message: 'Mock test updated successfully' });
  } catch (error) {
    logger.error({
      type: 'update_mocktest_error',
      mocktestKey: mocktestkey,
      userId: userid,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/saveMockTest', async (req, res) => {
    const { mocktestkey, filepath, scanname, questions, mtsessionname, date, scankey, userid } = req.body;
    
    logger.info({
      type: 'save_mocktest_attempt',
      mocktestKey: mocktestkey,
      scanKey: scankey,
      userId: userid
    });
  
    if (!filepath || !questions) {
      logger.warn({
        type: 'save_mocktest_failure',
        reason: 'missing_required_fields',
        userId: userid,
        hasFilepath: !!filepath,
        hasQuestions: !!questions
      });
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
      
      logger.info({
        type: 'save_mocktest_success',
        mocktestKey: mocktestkey,
        scanKey: scankey,
        userId: userid
      });
      
      res.json({ message: 'mocktest saved successfully', newEntry });
    } catch (error) {
      logger.error({
        type: 'save_mocktest_error',
        mocktestKey: mocktestkey,
        userId: userid,
        error: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Failed to save mocktest to the database ' });
    }
});
  
app.use('/mocktests', router);

app.listen(port, '0.0.0.0', () => {
    logger.info({
      type: 'server_start',
      service: 'mocktests_service',
      port: port,
      timestamp: new Date().toISOString()
    });
    console.log(`create mock tests server on ${port}`);
});