import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "../authentication/UserContext";
import ScansTab from "./ScansTab";
import FlashcardsTab from "./FlashcardsTab";
import TestsTab from "./TestsTab";
import { useLocation } from "react-router-dom";

const Library = () => {
  const [activeTab, setActiveTab] = useState("scans");
  const { userId } = useUser();
  const location = useLocation();
  const autoOpenScan = location.state?.autoOpenScan;

  useEffect(() => {
    if (location.state?.autoOpenScan) {
      setActiveTab('scans');
    }
  }, [location.state]);

  const tabs = [
    {
      id: 'scans',
      label: 'Scans',
      component: <ScansTab autoOpenScan={activeTab === 'scans' ? autoOpenScan : null} />
    },
    {
      id: "flashcards",
      label: "Flashcard Sets",
      component: <FlashcardsTab />,
    },
    {
      id: "tests",
      label: "Mock Tests",
      component: <TestsTab />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen mt-[7dvh] bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-[#0f0647]">Library</h1>
          <p className="text-lg text-gray-600 mt-3">
            Manage and organize all your study materials
          </p>
        </div>

        {/* Tab Navigation Card */}
        <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
          <div className="bg-white rounded-xl">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <nav className="flex space-x-8" aria-label="Library sections">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors hover:cursor-pointer ${
                      activeTab === tab.id
                        ? "border-[#0f0647] text-[#0f0647]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">{tabs.find((tab) => tab.id === activeTab)?.component}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Library;
