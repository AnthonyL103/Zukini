import React, { useState, useEffect } from 'react';

const AddFlashCards = ({ filepath, scanname, text, date, onClose }) => {
  const [flashcards, setFlashcards] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const generateFlashcards = async () => {
      try {
        const response = await fetch('http://localhost:5003/callparseFlashCards', {
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
        setFlashcards(result.text); // Assuming result.text contains the flashcards
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
    setFlashcards("");
    onClose(); 
  };

  return (
    <>
      <div className={`fcmodal-container ${showModal ? "show" : ""}`}>
        {showModal && (
            <div className="fcmodal-content">
                
                <p className="fcmodalText-para">{flashcards}</p>
            <div className="button-wrapper">
            <button
                className="fcmodal-button back"
                onClick={closefcmodal}
            >
            Done
            </button>
            <button
                className="fcmodal-button save"
                
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
