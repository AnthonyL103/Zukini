const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch'); // Import node-fetch for HTTP requests
const { parseTextFromFile } = require('./parse');
//allows to read and write files
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 5000;

app.use(cors());

// Configure Multer to save uploaded files to 'uploads/' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/uploads')); // Save to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});
const upload = multer({ storage });

const textJsonPath = path.join(__dirname, '/text.json');

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
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  console.log(`File uploaded: ${filePath}`);
  const now = new Date();
  const uploadDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`; // Format as MM/DD/YYYY

  // Return the file path to the client
  res.json({
    message: 'File uploaded successfully!',
    filePath: filePath, // Use relative path for simplicity
    uploadDate: uploadDate,
  });
});

app.post('/callparse', async (req, res) => {
  const { filePath } = req.body; // Correctly destructure filePath
  console.log('Received filePath:', filePath);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Invalid or missing file path' });
  }
  try {
    // Call the parsing function from parse.js
    const parsedText = await parseTextFromFile(filePath);
    //console.log('hello');
    

    res.json({
      message: 'File parsed successfully!',
      filename: filePath,
      text: parsedText,
    });
  } catch (error) {
    console.error('Error parsing file:', error);
    res.status(500).json({ error: 'Failed to parse file.' });
  }
});

app.post('/saveandexit', (req, res) => {
  const { filePath, parsedText, currDate } = req.body; // Extract filePath and parsedText from the JSON body

  if (!filePath || !parsedText) {
    return res.status(400).json({ message: 'filePath and parsedText are required' });
  }

  // Create a new entry with the filePath and parsedText
  const newEntry = {
    filename: filePath,
    text: parsedText,
    date: currDate,
  };

  // Append to JSON file immediately
  appendToJsonFile(newEntry);

  res.json({ message: 'Data saved successfully', newEntry });
});




app.listen(port, () => {
    console.log(`scan server on http://localhost:${port}`);
  });