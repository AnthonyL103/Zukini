const express = require('express');
const path = require('path');
const cors = require('cors');
const { parseTextFromBuffer } = require('./parse');
const { File } = require('./db');
//allows to read and write files
const fs = require('fs');
const formidable = require('formidable');
const app = express();
const router = express.Router();
app.use(express.json());
const port = 5002;

app.use(cors());


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


//do it at router level for scalability
router.post('/upload', async (req, res) => {
    try {
      //use formidable as we aren't using multer to process form anymore, and multer didn't allow for buffers

      const form = new formidable.IncomingForm();
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          return res.status(400).json({ error: 'Failed to parse form data' });
        }
        
        // Access the uploaded file by indexing, as formidable expects multiple files, and also fields is expected as well
        //even if it is empty when processing form data
        const uploadedFile = files.file[0]; // 'file' matches the FormData key from the frontend
        if (!uploadedFile) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
    
        // Read the file contents
        const fileContent = fs.readFileSync(uploadedFile.filepath); // Read file as a Buffer
  
        // Save file metadata and content to the database
        const now = new Date();
        const uploadDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  
        await File.create({
          filename: `uploads/${uploadedFile.originalFilename}`, 
          content: fileContent,                   
          uploadDate: now,                        
        });
  
        // Respond with success
        res.json({
          message: 'File uploaded successfully!',
          filePath: `uploads/${uploadedFile.originalFilename}`, 
          uploadDate: uploadDate,
        });
      });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(500).json({ error: 'Failed to upload file.' });
    }
  });
  
  module.exports = router;

app.post('/callparse', async (req, res) => {
  const { filePath } = req.body; 
  console.log('Received filePath:', filePath);
  if (!filePath) {
    return res.status(400).json({ error: 'Invalid or missing file path' });
  }
  try {
    // Call the parsing function from parse.js
    const fileRecord = await File.findOne({ where: { filename: filePath } });
    //console.log("made it");
    if (!fileRecord) {
        console.error(`File not found in the database for filePath: ${filePath}`);
        return res.status(404).json({ error: 'File not found in the database' });
      }
      
    // Access the binary content of the file which is stored as a buffer when you access it from database which is stored
    // as a blob (Binary large object)
    //console.log("file,");
    // Parse the file content
    const parsedText = await parseTextFromBuffer(fileRecord.content);
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
  const { filePath, scanName, parsedText, currDate } = req.body; // Extract filePath and parsedText from the JSON body

  if (!filePath || !parsedText) {
    return res.status(400).json({ message: 'filePath and parsedText are required' });
  }

  // Create a new entry with the filePath and parsedText
  const newEntry = {
    filepath: filePath,
    scanname: scanName,
    text: parsedText,
    date: currDate,
  };

  // Append to JSON file immediately
  appendToJsonFile(newEntry);

  res.json({ message: 'Data saved successfully', newEntry });
});



app.use('/', router); // Mount the router 

app.listen(port, () => {
    console.log(`handle add scan server on http://localhost:${port}`);
  });