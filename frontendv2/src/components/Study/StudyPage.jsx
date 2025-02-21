import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScan } from "../scans/ScanContext";
import StudyMenu from "../Header/StudyMenu";
import FlashcardMode from "./FlashcardMode";
import TestMode from "./TestMode";
import ReviewMode from "./ReviewMode";

const StudyPage = () => {
  const { currentScan, setCurrentScan } = useScan();
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState("review");
  const [annotations, setAnnotations] = useState([]);
  const [notes, setNotes] = useState("");
  const [studyProgress, setStudyProgress] = useState({
    flashcardsReviewed: 0,
    testsTaken: 0,
    averageScore: 0,
  });

  // Mode Selection Tabs
  const StudyModeSelector = () => (
    <div className="flex space-x-4 mb-6">
      {['review', 'flashcards', 'test'].map((mode) => (
        <button
          key={mode}
          onClick={() => setActiveMode(mode)}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors
            ${activeMode === mode 
              ? 'bg-[#0f0647] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen mt-[7dvh] bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-[#0f0647]">Study Session</h1>
          <p className="text-lg text-gray-600 mt-3">
            Choose your study mode and start learning
          </p>
        </div>

        {/* Study Mode Selection */}
        <StudyModeSelector />

        {/* Active Study Mode */}
        {activeMode === "review" && <ReviewMode />}
        {activeMode === "flashcards" && <FlashcardMode />}
        {activeMode === "test" && <TestMode />}
      </div>
    </motion.div>
  );
};

export default StudyPage;