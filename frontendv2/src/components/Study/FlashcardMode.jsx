import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScan } from '../scans/ScanContext'; // Ensure correct import
import { useFC } from '../flashcards/FCcontext'; // Ensure correct import
import { useUser } from '../authentication/UserContext';
import PencilLoader from '../utils/pencilloader';
import PastFlashCardList from '../flashcards/PastFlashcardList';
import { v4 as uuidv4 } from 'uuid';

export const FlashcardMode = () => {
  const { currentFC, setCurrentFC } = useFC(); // Ensure correct context
  const { currentScan } = useScan();
  const { userId, setTotalFlashcards} = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFCNameModal, setShowFCNameModal] = useState(false);
  const [FCName, setFCName] = useState("");
  const [DisplayedFC, setDisplayedFC] = useState([])
  const [savenabled, setSaveEnabled] = useState(false);
  const [showpastFC, setshowpastFC] = useState(true);
  const [FCentry, setFCEntry] = useState()
  const [showVA, setshowVA] = useState(false);
  const [isloading, setisLoading] = useState(false);
  
  useEffect(() => {
    if (currentFC) {
      console.log("currentFC.flashcards", currentFC.flashcards);
      setDisplayedFC(currentFC.flashcards); // Directly set it if it's an array
      console.log(DisplayedFC);
    } else {
      setDisplayedFC([]);
    }
  }, [currentFC]); 
  
  
  useEffect(() => {
    if (currentScan) {
      const flashcardStorageKey = `flashcards_${userId}_${currentScan.scankey}`;
      const storedFlashcards = localStorage.getItem(flashcardStorageKey);
      if (storedFlashcards) {
        console.log("Using cached flashcards from local storage.");
        setDisplayedFC(JSON.parse(storedFlashcards));
        setSaveEnabled(false);
      } else {
        generateFlashcards();
      }
    }
  }, [currentScan]); 
  
  
  
  

  const generateFlashcards = async () => {
    if (!currentScan) {
      console.error("No scan selected.");
      return;
    }
    setisLoading(true);
    setshowpastFC(false);
    
    const flashcardStorageKey = `flashcards_${userId}_${currentScan.scankey}`;

    // Check if flashcards exist for this user and scan
    const storedFlashcards = localStorage.getItem(flashcardStorageKey);
    if (storedFlashcards) {
        console.log("Loading flashcards from local storage for user:", userId);
        setDisplayedFC(JSON.parse(storedFlashcards));
        setSaveEnabled(false);
        return;
    }
  
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
        
      setSaveEnabled(true);
      setDisplayedFC(parsedFlashcards);
      setisLoading(false);
      setshowpastFC(true);
      localStorage.setItem(flashcardStorageKey, JSON.stringify(parsedFlashcards));
      console.log("Generated Flashcards:", parsedFlashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    }
  };
  
  const getFCName = () => {
    setShowFCNameModal(true);
  };
  

  
  const confirmSaveFC = () => {
    if (FCName.trim().length === 0) {
      alert("Please enter a flashcard name.");
      return;
    }
    setShowFCNameModal(false);
    setFCName("");
    handleSave();
  };
  
  
  const handleSave = async () => {
    try {
      const key = uuidv4();
      const payload = {
        flashcardkey: key,
        filepath: currentScan.filepath,
        scanname: currentScan.scanname,
        flashcards: DisplayedFC,
        fcsessionname: FCName,
        date: currentScan.date,
        scankey: currentScan.scankey,
        userid: userId,
      };

      const onsaveresponse = await fetch('https://api.zukini.com/flashcards/saveFlashCards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (onsaveresponse.ok) {
        setTotalFlashcards((prev) => prev + 1);
        setSaveEnabled(false);
        setCurrentFC(payload);
        setFCEntry(payload); 
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
      <div className="flex justify-between items-center gap-4"> 
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
        Flashcard Name: {currentFC?.fcsessionname || "None"}
      </h2>
      
      <button
              onClick={() => setshowVA(true)}
              className="py-2 px-6 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 w-32"
            >
              View All
      </button>
      
      </div>
      
      
      {DisplayedFC?.length > 0 ?(
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
              className="flex-1 py-2 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2 bg-[#67d7cc] hover:bg-[#5bc2b8] text-white rounded-lg hover:bg-opacity-90"
            >
              Next
            </button>
          </div>
          <div className="flex justify-between gap-4 mb-6">
          <button
            onClick={getFCName}
            className={`flex-1 py-2 rounded-lg text-white transition-opacity ${
                !savenabled
                ? "bg-gray-400 cursor-not-allowed opacity-50"  // Disabled state (gray)
                : "bg-[#0f0647] hover:bg-opacity-90 hover:bg-[#2c2099]"           // Normal state (blue)
            }`}
            disabled={!savenabled} 
            >
            Save Flashcard
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
      ) : isloading ? (
        <div className="flex justify-center items-center h-64">
          <PencilLoader />
        </div>
      ) : (
        <div className="bg-red-100 p-4 mt-6 rounded-lg text-red-700 text-center">
        No flashcard selected. Please select on or upload a scan.
        </div>
        
      )}
      
      {showpastFC && (
        <PastFlashCardList NewFCEntry={FCentry}/>
      )}
      
      {showFCNameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Enter a flashcard name
            </h2>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 mb-6 focus:outline-none"
              placeholder="Enter name..."
              value={FCName}
              onChange={(e) => setFCName(e.target.value)}
            />
            <div className="flex justify-around space-x-4">
            <button
                onClick={confirmSaveFC}
                className="hover:cursor-pointer px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-[#2faa4d] transition-all font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showVA && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-6xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-[#0f0647] mb-4 text-center">
                        All Flashcards
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DisplayedFC.map((fc, index) => (
                            <div 
                                key={index} 
                                className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                            >
                                <h3 className="font-semibold text-lg">{fc.question}</h3>
                                <p className="text-gray-600 mt-2">{fc.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={() => setshowVA(false)} 
                            className="flex-1 py-2 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

      
      
    </div>
    
  );
};

export default FlashcardMode;
