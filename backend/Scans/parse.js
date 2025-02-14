const vision = require('@google-cloud/vision');
const path = require('path');

const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, '../credentials.json'), // Path to your Google Cloud credentials JSON file
  });

  async function parseTextFromBuffer(buffer) {
    
    try {
      // Perform text detection on the image file
      
      const [result] = await client.textDetection({ image: { content: buffer } });
      const detections = result.textAnnotations;
  
      // Check if any text was detected
      if (detections.length > 0) {
        return detections[0].description; // The detected text
      } else {
        return 'No text detected.';
      }
    } catch (error) {
      console.error('Error during text parsing:', error);
      throw error; 
    }
  }
  async function parseTextFromPDF(buffer) {
    try {
      // Create the request for document text detection
      const request = {
        inputConfig: {
          content: buffer.toString('base64'), // PDF must be base64, so we swicth the buffer 
          mimeType: 'application/pdf',
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
          },
        ],
      };
  
      // Perform text detection
      const [response] = await client.batchAnnotateFiles({ requests: [request] });
  
      // Extract the text from the response
      const result = response.responses[0].responses[0].fullTextAnnotation;
  
      if (result && result.text) {
        return result.text; 
      } else {
        return 'No text detected.';
      }
    } catch (error) {
      console.error('Error during PDF text parsing:', error);
      throw error;
    }
  }
  
  module.exports = { parseTextFromBuffer, parseTextFromPDF };