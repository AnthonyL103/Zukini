import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MTProvider } from "../mocktests/MTcontext";
import { ScanProvider } from "../scans/ScanContext";
import { FCProvider } from "../flashcards/FCcontext";
import FlashcardMode from "./FlashcardMode";
import TestMode from "./TestMode";
import ReviewMode from "./ReviewMode";

const StudyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode = new URLSearchParams(location.search).get("mode") || "review";

  const [activeMode, setActiveMode] = useState(initialMode);

  useEffect(() => {
    // Ensure the mode persists even on refresh
    navigate(`/study?mode=${activeMode}`, { replace: true });
  }, [activeMode, navigate]);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    navigate(`/study?mode=${mode}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mt-6 mb-6">Study Session</h1>

        {/* Mode Selection Tabs */}
        <div className="flex space-x-4 mb-6">
          {["review", "flashcards", "test"].map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeMode === mode
                  ? "bg-[#0f0647] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Render Components Based on Mode */}
        {activeMode === "review" && (
          <ScanProvider>
          <ReviewMode />
          </ScanProvider>
        )}
        {activeMode === "flashcards" && (
          <FCProvider>
            <FlashcardMode />
          </FCProvider>
        )}
        {activeMode === "test" && (
          <MTProvider>
          <TestMode />
          </MTProvider>
        )}
      </div>
    </div>
  );
};


export default StudyPage;
