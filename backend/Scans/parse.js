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

        // Create initial request to get the total number of pages
        const initialRequest = {
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

        const [initialResponse] = await client.batchAnnotateFiles(initialRequest);
        const totalPages = initialResponse.responses[0]?.totalPages || 0;

        console.log(`Total pages in PDF: ${totalPages}`);

        let fullText = '';

        // Process pages in batches of 5
        for (let i = 0; i < totalPages; i += 5) {
            const pageBatch = Array.from({ length: Math.min(5, totalPages - i) }, (_, j) => i + j + 1);
            console.log(`Processing pages: ${pageBatch}`);

            const request = {
                requests: [
                    {
                        inputConfig: {
                            content: base64File,
                            mimeType: 'application/pdf',
                        },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                        pages: pageBatch, // Select the specific batch of 5 pages
                    },
                ],
            };

            const [response] = await client.batchAnnotateFiles(request);
            const responses = response.responses[0]?.responses || [];

            responses.forEach((res, index) => {
                if (res.fullTextAnnotation && res.fullTextAnnotation.text) {
                    fullText += `\n\n--- Page ${pageBatch[index]} ---\n\n${res.fullTextAnnotation.text}`;
                } else {
                    console.warn(`⚠️ No text detected on Page ${pageBatch[index]}`);
                }
            });
        }

        return fullText.trim() || 'No text detected.';
    } catch (error) {
        console.error('Error during PDF text parsing:', error);
        throw error;
    }
}




  
  module.exports = { parseTextFromBuffer, parseTextFromPDF };