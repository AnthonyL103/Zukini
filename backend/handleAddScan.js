const express = require('express');
const path = require('path');
const cors = require('cors');
const { parseTextFromBuffer, parseTextFromPDF } = require('./parse');
const { UploadFile, ParsedTextEntries } = require('./db');
//allows to read and write files
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const formidable = require('formidable');
const app = express();
const router = express.Router();
app.use(express.json());
const port = 5002;

app.use(cors());



async function appendTextToDB(newEntry) {
    try {
      // Insert the new entry into the database
      await ParsedTextEntries.create({
        scankey: newEntry.scankey,
        filepath: newEntry.filepath,      
        scanname: newEntry.scanname,
        value: newEntry.text,   
        date: newEntry.date
      });
  
      console.log('New entry appended to the database');
    } catch (error) {
      console.error('Error appending to the database:', error);
    }
  }

/*
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
*/


router.post('/callparse', async (req, res) => {
    try {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err,fields,files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(400).json({ error: 'Failed to parse form data' });
            }

            const uploadedFile = files.file[0]; 
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Read file as buffer
            const fileBuffer = fs.readFileSync(uploadedFile.filepath);
            const fileType = uploadedFile.mimetype || uploadedFile.originalFilename.split('.').pop();
            console.log('fileType:', fileType);
            // Determine how to parse based on file type
            let parsedText;
            if (fileType === 'application/pdf' || fileType === 'pdf') {
                parsedText = await parseTextFromPDF(fileBuffer);
            } else if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(fileType)) {
                parsedText = await parseTextFromBuffer(fileBuffer);
            } else {
                return res.status(400).json({ error: 'Unsupported file type.' });
            }

            const now = new Date();

            // Respond with parsed text (no file storage)
            res.json({
                message: 'File parsed successfully!',
                date: now.toISOString(),
                filePath: uploadedFile.originalFilename, // Just returning filename, not storing
                text: parsedText,
            });
        });
    } catch (error) {
        console.error('Error parsing file:', error);
        res.status(500).json({ error: 'Failed to parse file.' });
    }
});

module.exports = router;


app.post('/saveandexit', async (req, res) => {
  const {scankey, filePath, scanName, parsedText, currDate } = req.body; // Extract filePath and parsedText from the JSON body

  if (!filePath || !parsedText) {
    return res.status(400).json({ message: 'filePath and parsedText are required' });
  }
  //console.log("key", scankey);
  // Create a new entry with the filePath and parsedText
  const newEntry = {
    scankey: scankey,
    filepath: filePath,
    scanname: scanName,
    text: parsedText,
    date: currDate,
  };

  // Append to JSON file immediately
  try {
    // Call appendToDB to save the entry in the database
    await appendTextToDB(newEntry);

  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Failed to save data to the database.' });
  }

  res.json({ message: 'Data saved successfully'});
});



app.use('/', router); // Mount the router 

app.listen(port, () => {
    console.log(`handle add scan server on http://localhost:${port}`);
  });