import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useScan } from '../scans/ScanContext'; // Ensure correct import
import { useUser } from '../authentication/UserContext';
import { useFC } from '../flashcards/FCcontext';
import { Trash2 } from 'lucide-react';

const PastFlashCardList = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { setCurrentFC } = useFC();
  const { currentScan } = useScan();
  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  console.log(currentScan.scankey);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(`https://api.zukini.com/display/displayFCfromScanID?scanId=${currentScan.scankey}`);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        const data = await response.json();
        setFlashcards(data);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      }
    };

    fetchFlashcards();
  }, [userId]);

  const filteredFlashcards = flashcards.filter(flashcard =>
    flashcard.fcsessionname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudy = (flashcard) => {
    setSelectedFlashcard(flashcard);
    setShowStudyModal(true);
  };

  const handleStudyOption = (flashcard, type) => {
    setCurrentFC(flashcard);
    navigate('/study', { state: { initialMode: type } });
  };

  const handleDelete = (flashcard) => {
    setFlashcardToDelete(flashcard);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `https://api.zukini.com/display/deleteFC?userId=${userId}&key=${flashcardToDelete.flashcardkey}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete flashcard');

      setFlashcards(prevFlashcards =>
        prevFlashcards.filter(fc => fc.flashcardkey !== flashcardToDelete.flashcardkey)
      );
      setShowDeleteModal(false);
      setFlashcardToDelete(null);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search flashcards..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f0647] focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlashcards.map((flashcard) => (
          <div key={flashcard.flashcardkey} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all relative">
            <button 
              onClick={() => handleDelete(flashcard)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors rounded-full hover:bg-red-50"
              aria-label="Delete flashcard"
            >
              <Trash2 size={20} />
            </button>
            <h3 className="font-semibold text-lg mb-2 pr-8">{flashcard.fcsessionname}</h3>
            <p className="text-gray-600 text-sm mb-4">{new Date(flashcard.date).toLocaleDateString()}</p>
            <button 
              onClick={() => handleStudy(flashcard)}
              className="hover:cursor-pointer flex-1 px-3 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
            >
              Study
            </button>
          </div>
        ))}
      </div>

      {/* Study Options Modal */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300
        ${showStudyModal ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none"}`}>
        {showStudyModal && selectedFlashcard && (
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-6 text-center">
              Choose Study Mode
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleStudyOption(selectedFlashcard, 'flashcards')}
                className="hover:cursor-pointer w-full p-4 text-left bg-white rounded-xl border-2 border-[#0f0647] hover:bg-[#0f0647] hover:text-white transition-colors group"
              >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Flashcards</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                  Study using flashcards generated from this session
                </p>
              </button>

              <button
                onClick={() => handleStudyOption(selectedFlashcard, 'test')}
                className="hover:cursor-pointer w-full p-4 text-left bg-white rounded-xl border-2 border-[#67d7cc] hover:bg-[#67d7cc] hover:text-white transition-colors group"
              >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Mock Test</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                  Generate a mock test from these flashcards
                </p>
              </button>
            </div>

            <button
              onClick={() => setShowStudyModal(false)}
              className="hover:cursor-pointer mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && flashcardToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Delete Flashcard Session
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{flashcardToDelete.fcsessionname}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFlashcardToDelete(null);
                }}
                className="hover:cursor-pointer px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="hover:cursor-pointer px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastFlashCardList;
