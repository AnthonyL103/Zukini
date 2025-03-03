const express = require('express');
const { ParsedTextEntries, FlashCardEntries, MockTestEntries, userinfos } = require('../Database/db');
const cors = require('cors');
const PORT = 5001;

const app = express();
const router = express.Router(); 
app.use(cors());
app.use(express.json());

// Display scans (GET /displayscans)
router.get('/displayscans', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        console.log(userId);
        return res.status(400).json({ error: 'User ID is null' });
    }
    try {
      const scans = await ParsedTextEntries.findAll({
       where: { userid: userId }
      }); // Retrieve all entries from the database
      
      res.json(scans); // Send the data as JSON
    } catch (error) {
      console.error('Error retrieving scans from database:', error);
      res.status(500).json({ error: 'Failed to retrieve scans data.' });
    }
  });

router.get('/displayflashcards', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        console.log(userId);
        return res.status(400).json({ error: 'User ID is null' });
    }
    try {
      const PastFC = await FlashCardEntries.findAll({
       where: { userid: userId }
      }); // Retrieve all entries from the database
      
      res.json(PastFC); // Send the data as JSON
    } catch (error) {
      console.error('Error retrieving scans from database:', error);
      res.status(500).json({ error: 'Failed to retrieve scans data.' });
    }
});

router.get('/displayFCfromScanID', async (req, res) => {
    const { scanId } = req.query;

    if (!scanId) {
        return res.status(400).json({ error: 'Scan ID is required' });
    }

    try {
        // Retrieve all flashcards associated with the given scanId
        const pastFC = await FlashCardEntries.findAll({
            where: { scankey: scanId }
        });

        res.json(pastFC);
    } catch (error) {
        console.error('Error retrieving flashcards from database:', error);
        res.status(500).json({ error: 'Failed to retrieve flashcard data.' });
    }
});

router.get('/displaymocktests', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        console.log(userId);
        return res.status(400).json({ error: 'User ID is null' });
    }
    try {
      const PastMT = await MockTestEntries.findAll({
       where: { userid: userId }
      }); // Retrieve all entries from the database
      
      res.json(PastMT); // Send the data as JSON
    } catch (error) {
      console.error('Error retrieving scans from database:', error);
      res.status(500).json({ error: 'Failed to retrieve scans data.' });
    }
});

router.get('/displayMTfromScanID', async (req, res) => {
    const { scanId } = req.query;

    if (!scanId) {
        return res.status(400).json({ error: 'Scan ID is required' });
    }

    try {
        // Retrieve all flashcards associated with the given scanId
        const pastMT = await MockTestEntries.findAll({
            where: { scankey: scanId }
        });

        res.json(pastMT);
    } catch (error) {
        console.error('Error retrieving mocktests from database:', error);
        res.status(500).json({ error: 'Failed to retrieve mocktest data.' });
    }
});
  
// Delete a scan (POST /deleteScan)
router.delete('/deleteScan', async (req, res) => {
  const { key, userId } = req.query;
  console.log("backend", key);

  if (!key) {
      return res.status(400).json({ error: 'Scan key not provided' });
  }

  try {
      // Delete related flashcards associated with the scan
      const flashcardsDeleted = await FlashCardEntries.destroy({
          where: { scankey: key, userid: userId }
      });

      // Delete related mocktests associated with the scan
      const mocktestsDeleted = await MockTestEntries.destroy({
          where: { scankey: key, userid: userId }
      });

      // Now delete the scan itself
      const scanDeleted = await ParsedTextEntries.destroy({
          where: { scankey: key, userid: userId }
      });

      if (scanDeleted === 0) {
          // No scan was deleted
          return res.status(404).json({ error: 'Scan not found' });
      }

      console.log(`Deleted scan with key: ${key}`);
      console.log(`Deleted ${flashcardsDeleted} flashcards associated with scan`);
      console.log(`Deleted ${mocktestsDeleted} mocktests associated with scan`);

      res.status(200).json({
          message: 'Scan and associated flashcards/mocktests deleted successfully',
          deletedFlashcards: flashcardsDeleted,
          deletedMocktests: mocktestsDeleted
      });
  } catch (error) {
      console.error('Error deleting scan and related data:', error);
      res.status(500).json({ error: 'Failed to delete scan and associated data' });
  }
});

   

router.delete('/deleteFC', async (req, res) => {
    const { key, userId} = req.query;
    console.log("backend", key);
  
    if (!key) {
      return res.status(400).json({ error: 'key not sent' });
    }
  
    try {
      // Delete the scan with the matching filepath
      const result = await FlashCardEntries.destroy({ 
        where: {
        flashcardkey: key,
        userid: userId
        } 
    });
  
      if (result === 0) {
        // No rows were deleted
        return res.status(404).json({ error: 'fc not found' });
      }
  
      console.log(`Deleted fc with key: ${key}`);
      res.status(200).json({ message: 'fc deleted successfully' });
    } catch (error) {
      console.error('Error deleting fc from database:', error);
      res.status(500).json({ error: 'Failed to delete fc.' });
    }
  });
  
  router.delete('/deleteMT', async (req, res) => {
    const { key, userId} = req.query;
    console.log("backend", key);
  
    if (!key) {
      return res.status(400).json({ error: 'key not sent' });
    }
  
    try {
      // Delete the scan with the matching filepath
      const result = await MockTestEntries.destroy({ 
        where: {
        mocktestkey: key,
        userid: userId
        } 
    });
  
      if (result === 0) {
        // No rows were deleted
        return res.status(404).json({ error: 'mt not found' });
      }
  
      console.log(`Deleted mt with key: ${key}`);
      res.status(200).json({ message: 'mt deleted successfully' });
    } catch (error) {
      console.error('Error deleting mt from database:', error);
      res.status(500).json({ error: 'Failed to delete mt.' });
    }
  });
  // Start the server
  
  
  router.delete('/deleteGuestAll', async (req, res) => {
    console.log("at delete guest all");
    const { userId } = req.query;

    if (!userId || !userId.startsWith("guest-")) {
        return res.status(400).json({ error: 'Invalid guest user ID' });
    }

    try {
        await userinfos.destroy({ where: {id: userId}});
        await ParsedTextEntries.destroy({ where: { userid: userId } });
        await FlashCardEntries.destroy({ where: { userid: userId } });
        await MockTestEntries.destroy({ where: { userid: userId } });

        console.log(`Deleted all entries for guest user: ${userId}`);
        res.status(200).json({ message: 'All guest data deleted successfully' });

    } catch (error) {
        console.error('Error deleting guest user data:', error);
        res.status(500).json({ error: 'Failed to delete guest data.' });
    }
});

app.use('/display', router);


app.listen(PORT, '0.0.0.0', () => console.log(`Display server running on port ${PORT}`));


  