const express = require('express');
const { ParsedTextEntries } = require('./db');
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
  
// Delete a scan (POST /deleteScan)
app.post('/deleteScan', async (req, res) => {
    const { key } = req.body;
    console.log("backend", key);
  
    if (!key) {
      return res.status(400).json({ error: 'Filepath not sent' });
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
  
  // Start the server
  app.listen(PORT, '0.0.0.0', () => console.log(`Display server running on port ${PORT}`));