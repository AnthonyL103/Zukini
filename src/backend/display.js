const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = 5001;

const app = express();
const dataFilePath = path.join(__dirname, 'data.json');

app.get('/displayscans', (req, res) => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      const scans = JSON.parse(fileContent);
      res.json(scans);
    } else {
      res.json([]); // Return an empty array if the file doesn't exist
    }
  } catch (error) {
    console.error('Error reading JSON file:', error);
    res.status(500).json({ error: 'Failed to read scans data.' });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
