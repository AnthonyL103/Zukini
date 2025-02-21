import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScan } from '../scans/ScanContext'; // Ensure correct import
import { useUser } from '../authentication/UserContext'; // Ensure correct import
import { useFC } from '../flashcards/FCcontext'; // Ensure correct import
import PencilLoader from '../utils/pencilloader';
import { v4 as uuidv4 } from 'uuid';

export const FlashcardMode = () => {
  const { currentFC, setCurrentFC } = useFC(); // Ensure correct context
  const { currentScan } = useScan();
  const { userId } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFCNameModal, setShowFCNameModal] = useState(false);
  const [FCName, setFCName] = useState("");
  const [DisplayedFC, setDisplayedFC] = useState([])
  const [isLoading, setisLoading] = useState(false);
  console.log(currentScan, currentFC);
  useEffect(() => {
    if (currentFC) {
      setDisplayedFC(currentFC);
    } else {
      setDisplayedFC([]);  // Ensure DisplayedFC resets if currentFC is null
    }
  }, [currentFC]); // Runs whenever currentFC changes
  
  useEffect(() => {
    if (currentScan && currentFC.length === 0 ) {
        console.log("here");
      generateFlashcards();
    }
  }, [currentScan]); 
  
  
  

  const generateFlashcards = async () => {
    if (!currentScan) {
      console.error("No scan selected.");
      return;
    }
    setisLoading(true);
  
    const payload = {
      scanname: currentScan.scanname || "Unknown Scan",  // Ensure scanname is not undefined
      text: currentScan.value || "",                      // Ensure text is provided
      date: currentScan.date || new Date().toISOString() // Use current date if missing
    };
  
    console.log("Sending to API:", payload);
  
    try {
      const response = await fetch('https://api.zukini.com/flashcards/callparseFlashCards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to generate flashcards. Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      // Ensure result.text is valid
      if (!result.text || typeof result.text !== "string") {
        throw new Error("Invalid response format from API.");
      }
  
      // Parse flashcards
      const parsedFlashcards = result.text
        .split(/\n?Question:/) // Ensure consistency
        .filter(line => line.trim() && line.includes("Answer:")) // Ensure it's a valid QA pair
        .map((line, index) => {
          const [question, answer] = line.split('Answer:');
          return {
            id: `${index}-${Date.now()}`,
            question: question?.trim() || "Untitled Question",
            answer: answer?.trim() || "No Answer Provided"
          };
        });
        
      setisLoading(false);
      setCurrentFC(parsedFlashcards);
      console.log("Generated Flashcards:", parsedFlashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    }
  };
  
  
  
  const handleSave = async () => {
    setShowFCNameModal(true);
    try {
      const key = uuidv4();
      const payload = {
        flashcardkey: key,
        filePath: currentScan.filepath,
        scanName: currentScan.scanname,
        FlashCardtext: currentFC,
        FCsession: FCName,
        currDate: currentScan.date,
        scanId: currentScan.scankey,
        userId: userId,
      };

      const onsaveresponse = await fetch('https://api.zukini.com/flashcards/saveFlashCards', {
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
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % DisplayedFC.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + DisplayedFC.length) % DisplayedFC.length);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">Flashcard Mode</h2>
      
      {DisplayedFC.length > 0 ? (
        <>
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
                    ? DisplayedFC[currentIndex].answer
                    : DisplayedFC[currentIndex].question}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

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

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-[#0f0647] rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / DisplayedFC.length) * 100}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <PencilLoader/>
      )}
    </div>
  );
};

export default FlashcardMode;
