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

        // Create the request for document text detection
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

        // Perform text detection
        const [response] = await client.batchAnnotateFiles(request);

        // Extract the total number of pages
        const totalPages = response.responses[0]?.totalPages || 0;
        const responses = response.responses[0]?.responses || [];

        console.log(`Total pages in PDF: ${totalPages}`);
        console.log(`Total pages detected: ${responses.length}`);

        let fullText = '';

        for (let index = 0; index < totalPages; index++) {
            if (responses[index]?.fullTextAnnotation?.text) {
                fullText += `\n\n--- Page ${index + 1} ---\n\n${responses[index].fullTextAnnotation.text}`;
            } else {
                console.warn(`⚠️ No text detected on Page ${index + 1} or page is missing from API response.`);
            }
        }

        if (totalPages > responses.length) {
            console.warn(`⚠️ WARNING: Expected ${totalPages} pages, but only ${responses.length} were processed.`);
        }

        return fullText.trim() || 'No text detected.';
    } catch (error) {
        console.error('Error during PDF text parsing:', error);
        throw error;
    }
}



  
  module.exports = { parseTextFromBuffer, parseTextFromPDF };