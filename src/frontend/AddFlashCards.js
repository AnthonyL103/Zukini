import React, { useState, useEffect } from 'react';
import FlashCardList from './FlashCardList';
import { useUser } from './UserContext';
import { v4 as uuidv4 } from 'uuid';

const AddFlashCards = ({ filepath, scanname, text, date, onClose }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { userId } = useUser();
  
  useEffect(() => {
    const generateFlashcards = async () => {
      try {
        const response = await fetch('http://35.87.31.240:5003/callparseFlashCards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scanname, text, date }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate flashcards');
        }
  
        const result = await response.json();
  
        // Parse the result.text into question-answer pairs
        const parsedFlashcards = [];
        const lines = result.text.split('Question:').filter(line => line.trim() !== ''); // Split by "Question:"
  
        for (const line of lines) {
          const [questionPart, answerPart] = line.split('Answer:'); // Split into question and answer
          if (questionPart && answerPart) {
            parsedFlashcards.push({
              id: `${parsedFlashcards.length}-${Date.now()}`, // Generate a unique ID
              question: questionPart.trim(), // Trim spaces from the question
              answer: answerPart.trim(), // Trim spaces from the answer
            });
          }
        }
  
        setFlashcards(parsedFlashcards); 
        console.log(parsedFlashcards);
        setShowModal(true); 
      } catch (error) {
        console.error('Error generating flashcards:', error);
        alert('Failed to generate flashcards. Please try again.');
      }
    };
  
    generateFlashcards();
  }, [scanname, text, date]);
  

  const closefcmodal = () => {
    setShowModal(false);
    setFlashcards([]);
    //Pass flag as component to tell flashcardlist to clear its setvisible array 
    onClose(); 
  };
  
  const handleSave = async () => {
    // Save the flashcards to the database
    try {
        const key = uuidv4();
        console.log("currkey", key);
        const payload = {
            flashcardkey: key,
            filePath: filepath,
            scanName: scanname,
            FlashCardtext: flashcards,
            currDate: date,
            userId: userId,
        }
        const onsaveresponse = await fetch('http://35.87.31.240:5003/saveFlashCards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (onsaveresponse.ok) {
            console.log('Flashcards saved successfully');
        } else {    
          console.error('Failed to save flashcards');
        }
    } catch (error) {
        console.error('Error saving flashcards:', error);
        alert('Failed to save flashcards');
    }
    
    closefcmodal();
  };

  return (
    <>
        <div className={`fcmodal-container ${showModal ? "show" : ""}`}>
            {showModal && (
                <div className="fcmodal-content">
                    <FlashCardList
                        flashcards={flashcards}
                    />
                    <div className="fcmodal-content-footer">
                        <button
                            className="fcmodal-button back"
                            onClick={closefcmodal}
                        >
                            Done
                        </button>
                        <button
                            className="fcmodal-button save"
                            onClick={handleSave}
                        >
                            Save and Exit
                        </button>
                    </div>
                </div>
            )}
        </div>
    </>
);
};

export default AddFlashCards;