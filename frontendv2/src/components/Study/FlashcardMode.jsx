import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FlashcardMode = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards] = useState([
    { id: '1', question: 'Sample Question 1', answer: 'Sample Answer 1' },
    { id: '2', question: 'Sample Question 2', answer: 'Sample Answer 2' }
  ]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">Flashcard Mode</h2>
      
      {/* Flashcard Display */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="bg-gradient-to-r from-[#0f0647] to-[#67d7cc] p-1 rounded-xl mb-6 cursor-pointer"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={isFlipped ? 'back' : 'front'}
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl h-[300px] flex items-center justify-center"
          >
            <p className="text-xl text-center">
              {isFlipped 
                ? flashcards[currentIndex].answer 
                : flashcards[currentIndex].question}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-between gap-4 mb-6">
        <button 
          onClick={handlePrevious}
          className="flex-1 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-opacity-90"
        >
          Previous
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 py-2 bg-[#67d7cc] text-white rounded-lg hover:bg-opacity-90"
        >
          Next
        </button>
      </div>

      {/* Progress */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Progress</h3>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-[#0f0647] rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardMode;