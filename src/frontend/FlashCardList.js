import React, { useState, useEffect } from 'react';
import Flashcard from './FlashCard';

const FlashcardList = ({ flashcards = [] }) => {
    const [visibleFlashcards, setVisibleFlashcards] = useState([]); 
    
    useEffect(() => {
        if (flashcards.length > 0) {
            let currentIndex = 0;
    
            const interval = setInterval(() => {
                setVisibleFlashcards((prev) => [...prev, flashcards[currentIndex]]);
                console.log('Adding flashcard:', currentIndex, flashcards.length); 
                currentIndex++;
                if (currentIndex >= flashcards.length-1) {
                    clearInterval(interval); // Stop the interval when all flashcards are displayed
                }
            }, 400); 
            console.log("made it");
            return () => clearInterval(interval); 
        }
    }, [flashcards]);
    
    

    return (
        <div className="card-grid">
            {flashcards.map((flashcard) => (
                <Flashcard flashcard={flashcard} key={flashcard.id} />
            ))}
        </div>
    );
};

export default FlashcardList;
