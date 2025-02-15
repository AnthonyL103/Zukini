const express = require('express');
const { ParsedTextEntries, FlashCardEntries, MockTestEntries, userinfos } = require('../Database/db');
const cors = require('cors');
const PORT = 5001;

const app = express();

app.use(cors());
app.use(express.json());

// Display scans (GET /displayscans)
app.get('/displayscans', async (req, res) => {
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

app.get('/displayflashcards', async (req, res) => {
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

app.get('/displaymocktests', async (req, res) => {
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
  
// Delete a scan (POST /deleteScan)
app.delete('/deleteScan', async (req, res) => {
    const { key, userId} = req.query;
    console.log("backend", key);
  
    if (!key) {
      return res.status(400).json({ error: 'key not sent' });
    }
  
    try {
      // Delete the scan with the matching filepath
      const result = await ParsedTextEntries.destroy({ 
        where: {
        scankey: key,
        userid: userId
        } 
    });
  
      if (result === 0) {
        // No rows were deleted
        return res.status(404).json({ error: 'Scan not found' });
      }
  
      console.log(`Deleted scan with key: ${key}`);
      res.status(200).json({ message: 'Scan deleted successfully' });
    } catch (error) {
      console.error('Error deleting scan from database:', error);
      res.status(500).json({ error: 'Failed to delete scan.' });
    }
  });
  
   

app.delete('/deleteFC', async (req, res) => {
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
  
  app.delete('/deleteMT', async (req, res) => {
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
  
  
  app.delete('/deleteGuestAll', async (req, res) => {
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


  