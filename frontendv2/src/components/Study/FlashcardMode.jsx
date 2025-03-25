import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScan } from '../scans/ScanContext'; 
import { useFC } from '../flashcards/FCcontext'; 
import { useUser } from '../authentication/UserContext';
import PencilLoader from '../utils/pencilloader';
import PastFlashCardList from '../flashcards/PastFlashcardList';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react'

export const FlashcardMode = () => {
  const { currentFC, setCurrentFC } = useFC(); 
  const { currentScan } = useScan();
  const { userId, setTotalFlashcards, isPremium} = useUser();
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
  const [showAddFlashcardForm, setShowAddFlashcardForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [saveEdit, setsaveEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [regenerate, setRegenerate] = useState(false);
  
  useEffect(() => {
    if (currentFC && !saveEdit && !regenerate) {
      console.log("currentFC.flashcards", currentFC.flashcards);
      setDisplayedFC(currentFC.flashcards); 
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


  const handleAddFlashcard = () => {

    if (errorMessage){
      return;
    }
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setErrorMessage("All fields must be filled.");
      return;
    }
  
    const newFlashcard = {
      id: `${DisplayedFC.length}-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
    };
  
    setDisplayedFC([...DisplayedFC, newFlashcard]);
  
    //reset form after adding
    setShowAddFlashcardForm(false);
    setNewQuestion("");
    setNewAnswer("");
    setErrorMessage(""); 
    setSaveEnabled(true);
  };

  const handleCancel = () => {
    setShowAddFlashcardForm(false);
    setNewQuestion("");
    setNewAnswer(""); 
    setErrorMessage(""); 
  };
  
  
  const handleDeleteFlashcard = async (index) => {
    const updatedFlashcards = DisplayedFC.filter((_, i) => i !== index);
    setDisplayedFC(updatedFlashcards);
    setSaveEnabled(true); 
  };

  const handleAnswerChange = (question, answer) => {
    const trimmedQuestion = question.trim().toLowerCase();
    const trimmedAnswer = answer.trim().toLowerCase();
    
    if (trimmedQuestion.length > 0 && trimmedAnswer.length > 0 && trimmedQuestion === trimmedAnswer) {
      setErrorMessage("Question and answer cannot be the same.");
    } else {
      setErrorMessage("");
    }
  
    setSaveEnabled(true);
  };
  
  const handleSaveEditFlashcard = async () => {
    console.log("in save edit");
    setsaveEdit(true); // Show loading screen
  
    try {
  
      await handleSave();
  
      const deleteResponse = await fetch(
        `https://api.zukini.com/display/deleteFC?key=${currentFC.flashcardkey}&userId=${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete old flashcard");
      }
  
      console.log("Old flashcard deleted successfully");
  
      const flashcardStorageKey = `flashcards_${userId}_${currentScan.scankey}`;
      localStorage.setItem(flashcardStorageKey, JSON.stringify(DisplayedFC));
      console.log("Local storage updated with the new flashcard");
  
      setTimeout(() => {
        window.location.reload();
      }, 500);
  
    } catch (error) {
      console.error("Error updating flashcards:", error);
      alert("Failed to update flashcards. Please try again.");
    }
  };
  
  
  const handleSave = async () => {
    if (!currentScan) return;
    try {
      const key = uuidv4();
      const payload = {
        flashcardkey: key,
        filepath: currentScan.filepath,
        scanname: currentScan.scanname,
        flashcards: DisplayedFC,
        fcsessionname: FCName || currentFC.fcsessionname,
        date: currentScan.date,
        scankey: currentScan.scankey || "None",
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

  const generateFlashcards = async () => {
    if (!currentScan) {
      console.error("No scan selected.");
      return;
    }
    
    
    const flashcardStorageKey = `flashcards_${userId}_${currentScan.scankey}`;

    // Check if flashcards exist for this user and scan
    const storedFlashcards = localStorage.getItem(flashcardStorageKey);
    if (!isPremium && storedFlashcards) {
        console.log("Loading flashcards from local storage for user:", userId);
        setDisplayedFC(JSON.parse(storedFlashcards));
        setSaveEnabled(false);
        return;
    }

    setisLoading(true);
    setshowpastFC(false);
  
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
  
      if (!result.text || typeof result.text !== "string") {
        throw new Error("Invalid response format from API.");
      }
  
      const parsedFlashcards = result.text
        .split(/\n?Question:/) 
        .filter(line => line.trim() && line.includes("Answer:")) 
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
      setshowpastFC(true);
      localStorage.setItem(flashcardStorageKey, JSON.stringify(parsedFlashcards));
      console.log("Generated Flashcards:", parsedFlashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setisLoading(false);
      setRegenerate(false);
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

      <div className= "flex flex-row gap-4 py-4"> 

      {isPremium && (
        <button

          onClick={() => {
            generateFlashcards();
            setRegenerate(true);}}
          
          className={`flex flex-row py-2 px-4 gap-2'} ${
            regenerate
            ? "bg-gray-400 cursor-not-allowed opacity-50 rounded-lg" 
            : "bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 gap-1"
          } `}

        >
          <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    className="w-6 h-6 stroke-yellow-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                    ></path>
                  </svg>
          Regenerate
        </button>
      )}
      
      <button
              onClick={() => setshowVA(true)}
              className="py-2 px-4 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 min-w-32"
            >
              View/Edit
      </button>
      </div>
      
      </div>


      {isloading ?  (
        <div className="flex justify-center items-center h-64">
        <PencilLoader />
      </div>
      ) : DisplayedFC?.length > 0 ?(
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
            onClick={currentFC && savenabled ? handleSaveEditFlashcard : getFCName}
            className={`flex-1 py-2 rounded-lg text-white transition-opacity ${
                !savenabled
                ? "bg-gray-400 cursor-not-allowed opacity-50"  
                : "bg-[#0f0647] hover:bg-opacity-90 hover:bg-[#2c2099]"          
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
      ) : saveEdit ? ( 
        <div className="flex justify-center items-center h-64">
          <PencilLoader />
        </div>
      ) : (
        <div className="bg-red-100 p-4 mt-6 rounded-lg text-red-700 text-center">
        No flashcard selected. Please select or upload a scan.
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
                            className="relative bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                          >
                            <button 
                              onClick={() => handleDeleteFlashcard(index)}
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors rounded-full hover:bg-red-50"
                              aria-label="Delete flashcard"
                            >
                              <Trash2 size={20} />
                            </button>
                          
                            <h3 className="font-semibold text-lg pr-10">{fc.question}</h3>
                            <p className="text-gray-600 mt-2">{fc.answer}</p>
                          </div>
                          
                        ))}

                        {!showAddFlashcardForm ? (
                                       <button
                                       onClick={() => setShowAddFlashcardForm(true)}
                                       className="w-full h-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                     >
                                       + Add a New Flashcard
                                     </button>
                                   ) : (
                                     <div className="p-4 border rounded-lg">
                                       <h3 className="text-lg font-semibold mb-2">New Flashcard</h3>

                                        <input
                                          type="text"
                                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                                          placeholder="Enter question..."
                                          value={newQuestion}
                                          onChange={(e) => {
                                            const updatedQuestion = e.target.value;
                                            setNewQuestion(updatedQuestion);
                                            handleAnswerChange(updatedQuestion, newAnswer); 
                                          }}
                                        />

                                        <input
                                          type="text"
                                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                                          placeholder="Enter answer..."
                                          value={newAnswer}
                                          onChange={(e) => {
                                            const updatedAnswer = e.target.value;
                                            setNewAnswer(updatedAnswer);
                                            handleAnswerChange(newQuestion, updatedAnswer); 
                                          }}
                                        />

                                        {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}




                                       <div className="flex justify-between mt-4">
                                         <button
                                           onClick={handleAddFlashcard}
                                           className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                         >
                                           Add Flashcard
                                         </button>
                                         <button
                                           onClick={handleCancel}
                                           className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                         >
                                           Cancel
                                         </button>
                                       </div>
                                     </div>
                                   )}
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
