import React, { useState, useEffect } from 'react';
import FlashCardList from './FlashCardList';
import { useUser } from './UserContext';
import { v4 as uuidv4 } from 'uuid';

const AddFlashCards = ({ filepath, scanname, text, date, onClose, onDeletePrevFC, onClosePrevFC, onAddFlashCard, Past, prevFC }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [showModal, setShowModal] = useState(Past);
  const [showFCNameModal, setShowFCNameModal] = useState(false);
  const [FCName, setFCName] = useState("");
  const { userId } = useUser();


  useEffect(() => {
    if (Past) {
        setFlashcards(prevFC);
        setShowModal(true);
        return;
    }
    const generateFlashcards = async () => {
      try {
        const response = await fetch('http://18.236.227.203:5003/callparseFlashCards', {
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
  }, [Past, prevFC, scanname, text, date]);
  
  

  const closefcmodal = () => {
    //Pass flag as component to tell flashcardlist to clear its setvisible array 
    onClose();
    setShowModal(false);
    setFlashcards([]);
  };
  
  const closeprevfcmodal = () => {
    onClosePrevFC();
    //Pass flag as component to tell flashcardlist to clear its setvisible array 
    setShowModal(false);
    setFlashcards([]);
  };
  
  const deletefcmodalprev = () => {
    //Pass flag as component to tell flashcardlist to clear its setvisible array 
    onDeletePrevFC(); 
    setShowModal(false);
    setFlashcards([]);
  };
  
  const showNameModal = () => {
    setShowModal(false);
    setShowFCNameModal(true);
  }
  
  const closeNameModal = () => {
    setFCName("");
    setShowFCNameModal(false);
  }
  const confirmNameAndSave = () => {
    if (!FCName.trim()) {
      alert("Please enter a name for the flashcard set.");
      return;
    }

    handleSave();
    closeNameModal();
};
  
  const handleSave = async () => {
    // Save the flashcards to the database
    showNameModal();
    try {
        const key = uuidv4();
        console.log("currkey", key);
        const payload = {
            flashcardkey: key,
            filePath: filepath,
            scanName: scanname,
            FlashCardtext: flashcards,
            FCsession: FCName,
            currDate: date,
            userId: userId,
        }
        const onsaveresponse = await fetch('http://18.236.227.203:5003/saveFlashCards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (onsaveresponse.ok) {
            console.log('Flashcards saved successfully');
            if (onAddFlashCard) {
                const newEntry = {
                    flashcardkey: key,
                    filepath: filepath,
                    scanname: scanname,
                    fcsessionname: FCName,
                    flashcards: flashcards,
                    date: date
                }
                onAddFlashCard(newEntry);
            }
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
                    <h2>Rendered Flashcards:</h2>
                    <FlashCardList flashcards={flashcards} />
                    <div className="fcmodal-content-footer">
                        {Past ? (
                            <>
                                <button className="deleteWarn-buttoncancel" onClick={closeprevfcmodal}>
                                    Done
                                </button>
                                <button className="deleteWarn-button" onClick={deletefcmodalprev}>
                                    Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="deleteWarn-buttoncancel" onClick={closefcmodal}>
                                    Done
                                </button>
                                <button className="deleteWarn-button" onClick={showNameModal}>
                                    Save and Exit
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Move the name input modal outside */}
        {showFCNameModal && (
            <div className="EnterName-container show">
                <div className="EnterName-modal">
                    <h2 className="EnterName-heading">Enter Flashcard Set Name</h2>
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter name..."
                        value={FCName}
                        onChange={(e) => setFCName(e.target.value)}
                    />
                    <div className="EnterNamebutton-wrapper">
                        <button className="EnterName-button" onClick={confirmNameAndSave}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default AddFlashCards;