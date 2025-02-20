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
        const base64File = buffer.toString('base64');

        const request = {
            requests: [
                {
                    inputConfig: {
                        content: base64File,
                        mimeType: 'application/pdf',
                    },
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                },
            ],
        };

        const [response] = await client.batchAnnotateFiles(request);

        console.log("Full API Response:", JSON.stringify(response, null, 2)); // ✅ Log full API response

        const responses = response.responses[0].responses || [];
        console.log(`Total pages detected: ${responses.length}`);

        let fullText = '';

        responses.forEach((res, index) => {
            if (res.fullTextAnnotation && res.fullTextAnnotation.text) {
                fullText += `\n\n--- Page ${index + 1} ---\n\n${res.fullTextAnnotation.text}`;
            } else {
                console.warn(`⚠️ No text detected on Page ${index + 1}`);
            }
            console.log(`Processed Page ${index + 1}`);
        });

        return fullText.trim() || 'No text detected.';
    } catch (error) {
        console.error('Error during PDF text parsing:', error);
        throw error;
    }
}


  
  module.exports = { parseTextFromBuffer, parseTextFromPDF };