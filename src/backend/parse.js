const vision = require('@google-cloud/vision');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 0;

const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, 'credentials.json'), // Path to your Google Cloud credentials JSON file
  });

  async function parseTextFromFile(filePath) {
    try {
      // Perform text detection on the image file
      const [result] = await client.textDetection(filePath);
      const detections = result.textAnnotations;
  
      // Check if any text was detected
      if (detections.length > 0) {
        return detections[0].description; // The detected text
      } else {
        return 'No text detected.';
      }
    } catch (error) {
      console.error('Error during text parsing:', error);
      throw error; // Re-throw the error to be handled in the calling function
    }
  }
  
  module.exports = { parseTextFromFile };

  app.listen(port, () => {
    console.log(`Parse server running on http://localhost:${port}`);
  });