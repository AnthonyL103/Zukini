import React, { useState, useEffect } from 'react';
import Flashcard from './FlashCard';

const FlashcardList = ({setClearVisibleFlashcards, flashcards = [] }) => {
    const [visibleFlashcards, setVisibleFlashcards] = useState([]); 
    
    useEffect(() => {
        if (flashcards.length > 0) {
            let currentIndex = 0;
            
            const interval = setInterval(() => {
                if (currentIndex < flashcards.length - 1) {
                    setVisibleFlashcards((prev) => [...prev, flashcards[currentIndex]]);
                    console.log('Adding flashcard:', flashcards[currentIndex]); 
                    currentIndex++;
                } else {
                    clearInterval(interval); // Stop the interval when all flashcards are displayed
                }
            }, 400); 

            return () => clearInterval(interval); 
        }
    }, [flashcards]);
    
    useEffect(() => {
        if (setClearVisibleFlashcards) {
          setClearVisibleFlashcards(() => () => {
            setVisibleFlashcards([]); // Clear visible flashcards when triggered
          });
        }
      }, [setClearVisibleFlashcards]);
    

    return (
        <div className="card-grid">
            {visibleFlashcards.map((flashcard) => (
                <Flashcard flashcard={flashcard} key={flashcard.id} />
            ))}
        </div>
    );
};

export default FlashcardList;
