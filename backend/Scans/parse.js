const vision = require('@google-cloud/vision');
const path = require('path');
const { logger } = require('../logging');

const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, '../credentials.json'),
});

async function parseTextFromBuffer(buffer) {
    logger.info({
        type: 'image_parsing_attempt',
        bufferSize: buffer.length
    });
    
    try {
        // Perform text detection on the image file
        const [result] = await client.textDetection({ image: { content: buffer } });
        const detections = result.textAnnotations;
  
        // Check if any text was detected
        if (detections.length > 0) {
            const detectedText = detections[0].description;
            
            logger.info({
                type: 'image_parsing_success',
                bufferSize: buffer.length,
                detectedTextLength: detectedText.length,
                hasText: true
            });
            
            return detectedText;
        } else {
            logger.info({
                type: 'image_parsing_success',
                bufferSize: buffer.length,
                hasText: false
            });
            
            return 'No text detected.';
        }
    } catch (error) {
        logger.error({
            type: 'image_parsing_error',
            bufferSize: buffer.length,
            error: error.message,
            stack: error.stack
        });
        throw error; 
    }
}

async function parseTextFromPDF(buffer) {
    logger.info({
        type: 'pdf_parsing_attempt',
        bufferSize: buffer.length
    });
    
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

        logger.info({
            type: 'pdf_pages_detected',
            totalPages: totalPages
        });

        let fullText = '';

        // Process pages in batches of 5
        for (let i = 0; i < totalPages; i += 5) {
            const pageBatch = Array.from({ length: Math.min(5, totalPages - i) }, (_, j) => i + j + 1);
            
            logger.info({
                type: 'pdf_batch_processing',
                batchStart: pageBatch[0],
                batchEnd: pageBatch[pageBatch.length - 1],
                totalPages: totalPages
            });

            const request = {
                requests: [
                    {
                        inputConfig: {
                            content: base64File,
                            mimeType: 'application/pdf',
                        },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                        pages: pageBatch,
                    },
                ],
            };

            const [response] = await client.batchAnnotateFiles(request);
            const responses = response.responses[0]?.responses || [];

            responses.forEach((res, index) => {
                if (res.fullTextAnnotation && res.fullTextAnnotation.text) {
                    const pageText = res.fullTextAnnotation.text;
                    fullText += `\n\n--- Page ${pageBatch[index]} ---\n\n${pageText}`;
                    
                    logger.info({
                        type: 'pdf_page_parsed',
                        pageNumber: pageBatch[index],
                        textLength: pageText.length
                    });
                } else {
                    logger.warn({
                        type: 'pdf_page_no_text',
                        pageNumber: pageBatch[index]
                    });
                }
            });
        }

        const finalText = fullText.trim() || 'No text detected.';
        
        logger.info({
            type: 'pdf_parsing_success',
            totalPages: totalPages,
            totalTextLength: finalText.length,
            hasText: finalText !== 'No text detected.'
        });
        
        return finalText;
    } catch (error) {
        logger.error({
            type: 'pdf_parsing_error',
            bufferSize: buffer.length,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

module.exports = { parseTextFromBuffer, parseTextFromPDF };