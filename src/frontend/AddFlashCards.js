import {useState, useEffect, useRef} from 'react';


const AddFlashCards = async ({ filepath, scanname, text, date }) => {
    try {
      // Backend endpoint for generating flashcards
      const endpoint = 'http://localhost:5003/callparseFlashCards';
  
      // Make the POST request to the backend
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scanname, text, date }),
      });
      console.log("made it")
  
      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }
  
      const result = await response.json();
      console.log('Flashcards generated successfully:', result);
  
      return result; // Return the generated flashcards
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error; // Propagate the error for handling in the calling function
    }
  };
  
  export default AddFlashCards;
  