const express = require('express');
const path = require('path');
const cors = require('cors');
const { parseTextFromBuffer, parseTextFromPDF } = require('./parse');
const { summarizeNotes } = require('./summarize');
const { userinfos, ParsedTextEntries } = require('../Database/db');
const { logger } = require('../logging');

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const formidable = require('formidable');
const app = express();
const router = express.Router();
app.use(express.json());
const port = 5002;

app.use(cors());

async function ensureGuestUserExists(userId) {
    logger.info({
        type: 'ensure_guest_user_attempt',
        userId: userId
    });
    
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
            
            logger.info({
                type: 'guest_user_created',
                userId: userId
            });
        } else {
            logger.info({
                type: 'guest_user_exists',
                userId: userId
            });
        }
    }
}

async function appendTextToDB(newEntry) {
    logger.info({
        type: 'scan_db_append_attempt',
        scanKey: newEntry.scankey,
        userId: newEntry.userid
    });
    
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
  
      logger.info({
        type: 'scan_db_append_success',
        scanKey: newEntry.scankey,
        userId: newEntry.userid
      });
    } catch (error) {
      logger.error({
        type: 'scan_db_append_error',
        scanKey: newEntry.scankey,
        userId: newEntry.userid,
        error: error.message,
        stack: error.stack
      });
    }
}

router.post('/callparse', async (req, res) => {
    logger.info({
        type: 'parse_file_attempt'
    });
    
    try {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                logger.error({
                    type: 'form_parse_error',
                    error: err.message,
                    stack: err.stack
                });
                return res.status(400).json({ error: 'Failed to parse form data' });
            }

            const uploadedFile = files.file[0]; 
            if (!uploadedFile) {
                logger.warn({
                    type: 'parse_file_failure',
                    reason: 'no_file_uploaded'
                });
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileBuffer = fs.readFileSync(uploadedFile.filepath);
            const fileType = uploadedFile.mimetype || uploadedFile.originalFilename.split('.').pop();
            
            logger.info({
                type: 'file_processing',
                fileType: fileType,
                fileName: uploadedFile.originalFilename,
                fileSize: fileBuffer.length
            });
            
            let parsedText;
            if (fileType === 'application/pdf' || fileType === 'pdf') {
                logger.info({
                    type: 'parsing_pdf',
                    fileName: uploadedFile.originalFilename
                });
                parsedText = await parseTextFromPDF(fileBuffer);
            } else if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(fileType)) {
                logger.info({
                    type: 'parsing_image',
                    fileName: uploadedFile.originalFilename,
                    imageType: fileType
                });
                parsedText = await parseTextFromBuffer(fileBuffer);
            } else {
                logger.warn({
                    type: 'parse_file_failure',
                    reason: 'unsupported_file_type',
                    fileType: fileType
                });
                return res.status(400).json({ error: 'Unsupported file type.' });
            }

            const now = new Date();
            
            logger.info({
                type: 'parse_file_success',
                fileName: uploadedFile.originalFilename,
                textLength: parsedText ? parsedText.length : 0
            });

            res.json({
                message: 'File parsed successfully!',
                date: now.toISOString(),
                filePath: uploadedFile.originalFilename, 
                text: parsedText,
            });
        });
    } catch (error) {
        logger.error({
            type: 'parse_file_error',
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to parse file.' });
    }
});

router.post('/callsummarize', async (req, res) => {
    const { text } = req.body;
    
    logger.info({
        type: 'summarize_attempt',
        textLength: text ? text.length : 0
    });

    if (!text) {
        logger.warn({
            type: 'summarize_failure',
            reason: 'missing_text'
        });
        return res.status(400).json({ message: 'No text found' });
    }

    try {
        const summary = await summarizeNotes(text);
        
        logger.info({
            type: 'summarize_success',
            textLength: text.length,
            summaryLength: summary ? summary.length : 0
        });
        
        res.status(200).json({ summary });
    } catch (error) {
        logger.error({
            type: 'summarize_error',
            textLength: text.length,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to summarize text.' });
    }
});


router.get('/getscan', async (req, res) => {
    const { scankey } = req.query;
    
    logger.info({
        type: 'get_scan_attempt',
        scanKey: scankey
    });

    if (!scankey) {
        logger.warn({
            type: 'get_scan_failure',
            reason: 'missing_scan_key'
        });
        return res.status(400).json({ message: 'scankey is required' });
    }

    try {
        const scanEntry = await ParsedTextEntries.findOne({ where: { scankey } });

        if (!scanEntry) {
            logger.warn({
                type: 'get_scan_failure',
                reason: 'scan_not_found',
                scanKey: scankey
            });
            return res.status(404).json({ message: 'Scan not found' });
        }

        logger.info({
            type: 'get_scan_success',
            scanKey: scankey,
            userId: scanEntry.userid
        });

        res.json({
            message: 'Scan retrieved successfully',
            scan: scanEntry
        });

    } catch (error) {
        logger.error({
            type: 'get_scan_error',
            scanKey: scankey,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Failed to retrieve scan from the database' });
    }
});


router.post('/saveandexit', async (req, res) => {
  const {scankey, filePath, scanName, parsedText, currDate, userId } = req.body;
  
  logger.info({
      type: 'save_scan_attempt',
      scanKey: scankey,
      userId: userId
  });

  if (!filePath || !parsedText) {
    logger.warn({
        type: 'save_scan_failure',
        reason: 'missing_required_fields',
        userId: userId,
        hasFilePath: !!filePath,
        hasParsedText: !!parsedText
    });
    return res.status(400).json({ message: 'filePath and parsedText are required' });
  }
  
  const newEntry = {
    scankey: scankey,
    filepath: filePath,
    scanname: scanName,
    text: parsedText,
    date: currDate,
    userid: userId,
  };

  try {
    await appendTextToDB(newEntry);
    
    logger.info({
        type: 'save_scan_success',
        scanKey: scankey,
        userId: userId
    });

    res.json({ message: 'Data saved successfully'});
  } catch (error) {
    logger.error({
        type: 'save_scan_error',
        scanKey: scankey,
        userId: userId,
        error: error.message,
        stack: error.stack
    });
    res.status(500).json({ message: 'Failed to save data to the database.' });
  }
});


app.use('/scans', router); 

app.listen(port, '0.0.0.0', () => {
    logger.info({
        type: 'server_start',
        service: 'scans_service',
        port: port,
        timestamp: new Date().toISOString()
    });
    console.log(`handle add scan server on ${port}`);
});
  
module.exports = router;