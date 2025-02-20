import React, { useState, useEffect } from 'react';
import FlashCardList from './FlashCardList';
import { useUser } from '../authentication/UserContext';
import { v4 as uuidv4 } from 'uuid';

const AddFlashCards = ({ filepath, scanname, text, date, onClose, onDeletePrevFC, onClosePrevFC, onAddFlashCard, Past, prevFC, setisLoading}) => {
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
        const response = await fetch('https://api.zukini.com/flashcards/callparseFlashCards', {
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
    setisLoading(false);
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
        const onsaveresponse = await fetch('https://api.zukini.com/flashcards/saveFlashCards', {
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
       
       <div className={`fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 
        ${showModal ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none"}`}>
        {showModal && (
        <div className="relative bg-white w-full h-full md:w-3/5 md:max-h-[90vh] overflow-y-auto rounded-2xl p-5 text-center flex flex-col touch-manipulation z-50 shadow-lg overscroll-contain">
            <p className="text-xl font-semibold mb-3">Rendered Flashcards:</p>
            <div className="flex-1 overflow-y-auto p-4">
                <FlashCardList flashcards={flashcards} />
            </div>

            <div className="mt-auto flex justify-between sticky bottom-0 p-4 bg-white">
                {Past ? (
                    <>
                        <button 
                            onClick={closeprevfcmodal}
                            className="w-[48%] border-none px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-300 hover:bg-gray-800"
                        >
                            Done
                        </button>
                        <button 
                            onClick={deletefcmodalprev}
                            className="w-[48%] border-none px-6 py-3 bg-red-600 text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-300 hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={closefcmodal}
                            className="w-[48%] border-none px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-300 hover:bg-gray-800"
                        >
                            Done
                        </button>
                        <button 
                            onClick={showNameModal}
                            className="w-[48%] border-none px-6 py-3 bg-blue-600 text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-300 hover:bg-blue-700"
                        >
                            Save and Exit
                        </button>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>



        {/* Name Input Modal */}
        {showFCNameModal && (
             <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
                    <h2 className="text-xl font-semibold text-gray-900">Enter Flashcard Set Name</h2>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            placeholder="Enter name..."
                            value={FCName}
                            onChange={(e) => setFCName(e.target.value)}
                        />
                        <button 
                            className="w-1/2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
                            onClick={confirmNameAndSave}
                        >
                            Confirm
                        </button>
                    
                </div>
            </div>
        )}
    </>
);
};

export default AddFlashCards;