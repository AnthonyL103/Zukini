const express = require('express');
const { logger } = require('../logging'); 
const { ParsedTextEntries, FlashCardEntries, MockTestEntries, userinfos } = require('../Database/db');
const cors = require('cors');
const PORT = 5001;

const app = express();
const router = express.Router(); 
app.use(cors());
app.use(express.json());

router.get('/displayscans', async (req, res) => {
    const { userId } = req.query;
    logger.info({
      type: 'display_scans_attempt',
      userId: userId
  });
    if (!userId) {
      logger.warn({
        type: 'display_scans_failure',
        reason: 'missing_user_id',
        userId: userId
    });
        return res.status(400).json({ error: 'User ID is null' });
    }
    try {
      const scans = await ParsedTextEntries.findAll({
       where: { userid: userId }
      }); 

      logger.info({
        type: 'display_scans_success',
        userId: userId,
        count: scans.length
    });
      
      res.json(scans); 
    } catch (error) {
      logger.error({
        type: 'display_scans_error',
        userId: userId,
        error: error.message,
        stack: error.stack
    });
      res.status(500).json({ error: 'Failed to retrieve scans data.' });
    }
  });

router.get('/displayflashcards', async (req, res) => {
    const { userId } = req.query;

    logger.info({
      type: 'display_flashcards_attempt',
      userId: userId
    });

    if (!userId) {
        console.log(userId);
        return res.status(400).json({ error: 'User ID is null' });
    }
    try {
      const PastFC = await FlashCardEntries.findAll({
       where: { userid: userId }
      }); 

      logger.info({
        type: 'display_flashcards_success',
        userId: userId,
        count: PastFC.length
      });
      
      res.json(PastFC); 
    } catch (error) {
      logger.error({
        type: 'display_flashcards_error',
        userId: userId,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to retrieve scans data.' });
    }
});

router.get('/displayFCfromScanID', async (req, res) => {
    const { scanId } = req.query;

    logger.info({
      type: 'display_fc_from_scan_attempt',
      scanId: scanId
    });

    if (!scanId) {
        logger.warn({
          type: 'display_fc_from_scan_failure',
          reason: 'missing_scan_id'
      });
        return res.status(400).json({ error: 'Scan ID is required' });
    }

    try {
        const pastFC = await FlashCardEntries.findAll({
            where: { scankey: scanId }
        });

        logger.info({
          type: 'display_fc_from_scan_success',
          scanId: scanId,
          count: pastFC.length
      });

        res.json(pastFC);
    } catch (error) {
      logger.error({
        type: 'display_fc_from_scan_error',
        scanId: scanId,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to retrieve flashcard data.' });
    }
});

router.get('/displaymocktests', async (req, res) => {
    const { userId } = req.query;

    logger.info({
      type: 'display_mocktests_attempt',
      userId: userId
    });
    if (!userId) {
      logger.warn({
        type: 'display_mocktests_failure',
        reason: 'missing_user_id',
        userId: userId
      });
      return res.status(400).json({ error: 'User ID is null' });
    }
    try {
      const PastMT = await MockTestEntries.findAll({
       where: { userid: userId }
      }); 

      logger.info({
        type: 'display_mocktests_success',
        userId: userId,
        count: PastMT.length
    });
      
      res.json(PastMT); 
    } catch (error) {
      logger.error({
        type: 'display_mocktests_error',
        userId: userId,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to retrieve scans data.' });
    }
});

router.get('/displayMTfromScanID', async (req, res) => {
    const { scanId } = req.query;

    logger.info({
      type: 'display_mt_from_scan_attempt',
      scanId: scanId
    });

    if (!scanId) {
      logger.warn({
        type: 'display_mt_from_scan_failure',
        reason: 'missing_scan_id'
      });
      return res.status(400).json({ error: 'Scan ID is required' });
    }

    try {
        const pastMT = await MockTestEntries.findAll({
            where: { scankey: scanId }
        });

        logger.info({
          type: 'display_mt_from_scan_success',
          scanId: scanId,
          count: pastMT.length
        });

        res.json(pastMT);
    } catch (error) {
      logger.error({
        type: 'display_mt_from_scan_error',
        scanId: scanId,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to retrieve mocktest data.' });
    }
});
  
router.delete('/deleteScan', async (req, res) => {
  const { key, userId } = req.query;
  logger.info({
    type: 'delete_scan_attempt',
    scanKey: key,
    userId: userId
  });

  if (!key) {
    logger.warn({
      type: 'delete_scan_failure',
      reason: 'missing_scan_key',
      userId: userId
    });
    return res.status(400).json({ error: 'Scan key not provided' });
  }

  try {
      const flashcardsDeleted = await FlashCardEntries.destroy({
          where: { scankey: key, userid: userId }
      });

      const mocktestsDeleted = await MockTestEntries.destroy({
          where: { scankey: key, userid: userId }
      });

      const scanDeleted = await ParsedTextEntries.destroy({
          where: { scankey: key, userid: userId }
      });

      if (scanDeleted === 0) {
        logger.warn({
          type: 'delete_scan_failure',
          reason: 'scan_not_found',
          scanKey: key,
          userId: userId
         });
        return res.status(404).json({ error: 'Scan not found' });
      }

      logger.info({
        type: 'delete_scan_success',
        scanKey: key,
        userId: userId,
        flashcardsDeleted,
        mocktestsDeleted
      });

      res.status(200).json({
          message: 'Scan and associated flashcards/mocktests deleted successfully',
          deletedFlashcards: flashcardsDeleted,
          deletedMocktests: mocktestsDeleted
      });
  } catch (error) {
    logger.error({
      type: 'delete_scan_error',
      scanKey: key,
      userId: userId,
      error: error.message,
      stack: error.stack
     });
    res.status(500).json({ error: 'Failed to delete scan and associated data' });
  }
});

   

router.delete('/deleteFC', async (req, res) => {
    const { key, userId} = req.query;

    logger.info({
      type: 'delete_flashcard_attempt',
      flashcardKey: key,
      userId: userId
    });
  
    if (!key) {
      logger.warn({
        type: 'delete_flashcard_failure',
        reason: 'missing_flashcard_key',
        userId: userId
      });
      return res.status(400).json({ error: 'key not sent' });
    }
  
    try {
      const result = await FlashCardEntries.destroy({ 
        where: {
        flashcardkey: key,
        userid: userId
        } 
    });
  
      if (result === 0) {
        logger.warn({
          type: 'delete_flashcard_failure',
          reason: 'flashcard_not_found',
          flashcardKey: key,
          userId: userId
       });
        return res.status(404).json({ error: 'fc not found' });
      }

      logger.info({
        type: 'delete_flashcard_success',
        flashcardKey: key,
        userId: userId
      });
  
      res.status(200).json({ message: 'fc deleted successfully' });
    } catch (error) {
      logger.error({
        type: 'delete_flashcard_error',
        flashcardKey: key,
        userId: userId,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to delete fc.' });
    }
  });
  
  router.delete('/deleteMT', async (req, res) => {
    const { key, userId} = req.query;
    logger.info({
      type: 'delete_mocktest_attempt',
      mocktestKey: key,
      userId: userId
    });
  
    if (!key) {
      logger.warn({
        type: 'delete_mocktest_failure',
        reason: 'missing_mocktest_key',
        userId: userId
      });
      return res.status(400).json({ error: 'key not sent' });
    }
  
    try {
      const result = await MockTestEntries.destroy({ 
        where: {
        mocktestkey: key,
        userid: userId
        } 
    });
  
      if (result === 0) {
        logger.warn({
          type: 'delete_mocktest_failure',
          reason: 'mocktest_not_found',
          mocktestKey: key,
          userId: userId
        });
        return res.status(404).json({ error: 'mt not found' });
      }
  
      logger.info({
        type: 'delete_mocktest_success',
        mocktestKey: key,
        userId: userId
      });
      res.status(200).json({ message: 'mt deleted successfully' });
    } catch (error) {
      logger.error({
        type: 'delete_mocktest_error',
        mocktestKey: key,
        userId: userId,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to delete mt.' });
    }
  });
  
  
  router.delete('/deleteGuestAll', async (req, res) => {
    const { userId } = req.query;

    logger.info({
      type: 'delete_guest_all_attempt',
      userId: userId
    });

    if (!userId || !userId.startsWith("guest-")) {
      logger.warn({
        type: 'delete_guest_all_failure',
        reason: 'invalid_guest_id',
        userId: userId
    });
      return res.status(400).json({ error: 'Invalid guest user ID' });
    }

    try {
        const userDeleted = await userinfos.destroy({ where: {id: userId}});
        const scansDeleted = await ParsedTextEntries.destroy({ where: { userid: userId } });
        const flashcardsDeleted = await FlashCardEntries.destroy({ where: { userid: userId } });
        const mocktestsDeleted = await MockTestEntries.destroy({ where: { userid: userId } });

        logger.info({
          type: 'delete_guest_all_success',
          userId: userId,
          userDeleted,
          scansDeleted,
          flashcardsDeleted,
          mocktestsDeleted
        });
        res.status(200).json({ message: 'All guest data deleted successfully' });

    } catch (error) {
      logger.error({
        type: 'delete_guest_all_error',
        userId: userId,
        error: error.message,
        stack: error.stack
    });
      res.status(500).json({ error: 'Failed to delete guest data.' });
    }
});

app.use('/display', router);


app.listen(PORT, '0.0.0.0', () => {
  logger.info({
    type: 'server_start',
    service: 'display_service',
    port: PORT,
    timestamp: new Date().toISOString()
 });
  console.log(`Display server running on port ${PORT}` );
 });


  