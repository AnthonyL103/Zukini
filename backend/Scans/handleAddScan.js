const express = require('express');
const path = require('path');
const cors = require('cors');
const { parseTextFromBuffer, parseTextFromPDF } = require('./parse');
const { userinfos, ParsedTextEntries } = require('../Database/db');

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const formidable = require('formidable');
const app = express();
const router = express.Router();
app.use(express.json());
const port = 5002;

app.use(cors());

async function ensureGuestUserExists(userId) {
    if (userId.startsWith("guest-")) {
        const existingGuest = await userinfos.findOne({ where: { id: userId } });

        if (!existingGuest) {
            await userinfos.create({
                id: userId,
                email: `${uuidv4()}@guest.local`, 
                password: `${uuidv4()}`,
                createdat: new Date(),
                name: `guest${uuidv4()}`
            });
            console.log(`Guest user ${userId} added to userinfos`);
        }
    }
}

async function appendTextToDB(newEntry) {
    try {
      await ensureGuestUserExists(newEntry.userid);
        
      // Insert the new entry into the database
      await ParsedTextEntries.create({
        scankey: newEntry.scankey,
        filepath: newEntry.filepath,      
        scanname: newEntry.scanname,
        value: newEntry.text,   
        date: newEntry.date,
        userid: newEntry.userid,
      });
  
      console.log('New entry appended to the database');
    } catch (error) {
      console.error('Error appending to the database:', error);
    }
  }



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




router.post('/saveandexit', async (req, res) => {
  const {scankey, filePath, scanName, parsedText, currDate, userId } = req.body; // Extract filePath and parsedText from the JSON body

  if (!filePath || !parsedText) {
    return res.status(400).json({ message: 'filePath and parsedText are required' });
  }
  //console.log("key", scankey);
  
  console.log(userId);
  const newEntry = {
    scankey: scankey,
    filepath: filePath,
    scanname: scanName,
    text: parsedText,
    date: currDate,
    userid: userId,
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



app.use('/scans', router); // Mount the router 

app.listen(port, '0.0.0.0', () => {
    console.log(`handle add scan server on ${port}`);
  });
  
module.exports = router;