const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
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

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({
      message: 'File uploaded successfully!',
      filename: req.file.filename,
    });
  });

app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });