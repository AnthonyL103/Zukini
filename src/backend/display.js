const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const PORT = 5001;

const app = express();
const dataFilePath = path.join(__dirname, 'text.json');

app.use(cors());
app.use(express.json());

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

app.post('/deleteScan', (req, res) => {
  const { filepath } = req.body; // Use filepath as the identifier
  console.log('Request body:', req.body);


  if (!filepath) {
    return res.status(400).json({ error: 'Filepath not sent' });
  }

  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ error: 'Data file not found' });
    }

    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    let scans = JSON.parse(fileContent);

    // Filter out the scan with the matching filepath
    const updatedScans = scans.filter((scan) => scan.filepath !== filepath);

    // Write the updated data back to the JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedScans, null, 2), 'utf8');

    console.log(`Deleted scan with filepath: ${filepath}`);
    res.status(200).json({ message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('Error updating JSON file:', error);
    res.status(500).json({ error: 'Failed to delete scan.' });
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
