import React, { useState, useEffect } from "react";
import { useUser } from '../authentication/UserContext';
import { Trash2 } from 'lucide-react';
import { useAppState, useAppDispatch, AppActions } from "../utils/appcontext";

const PastFlashCardList = ({NewFCEntry}) => {
  const { userId } = useUser();
  const dispatch = useAppDispatch();
  const appState = useAppState();

  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);

  useEffect(() => {
    if (!appState.currentScan) {
        return;
    }
    const fetchFlashcards = async () => {
        try {
            const response = await fetch(`https://api.zukini.com/display/displayFCfromScanID?scanId=${appState.currentScan.scankey}`);
            if (!response.ok) throw new Error('Failed to fetch flashcards');
            const data = await response.json();
            setFlashcards(data);
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        }
    };

    fetchFlashcards();
}, [userId, appState.currentFC, flashcards.length]);
  
  useEffect(() => {
    if (NewFCEntry) {
        console.log(NewFCEntry);
        setFlashcards(prevEntries => [...prevEntries, NewFCEntry]);
    }
}, [NewFCEntry]);

  const filteredFlashcards = flashcards.filter(flashcard =>
    flashcard.fcsessionname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudyFC = (flashcard) => {
    // Use dispatch to update current flashcard
    dispatch(AppActions.setCurrentFC(flashcard));
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
      
      // Use dispatch to reset current flashcard
      dispatch(AppActions.setCurrentFC(null));
      setFlashcardToDelete(null);
      
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  return (
    <div className="mt-6">
        <h2 className="text-2xl font-bold text-[#0f0647]">
          Past Flashcards
        </h2>
      <div className="mb-6 mt-6">
      <input
            type="text"
            placeholder={flashcards.length === 0 ? "No Flashcards associated with this scan." : "Search mock tests..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f0647] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={flashcards.length === 0} 
            style={{
            backgroundColor: flashcards.length === 0 ? "#f0f0f0" : "white",
            cursor: flashcards.length === 0 ? "not-allowed" : "text",
            }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlashcards.length > 0 ? (
        filteredFlashcards.map((flashcard) => (
          <div key={flashcard.flashcardkey} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all relative">
            <button 
              onClick={() => handleDelete(flashcard)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors rounded-full hover:bg-red-50"
              aria-label="Delete flashcard"
            >
              <Trash2 size={20} />
            </button>
            <h3 className="font-semibold text-lg mb-2 pr-8">{flashcard.fcsessionname}</h3>
            <p className="text-gray-600 text-sm mb-4 ">{new Date(flashcard.date).toLocaleDateString()}</p>
            <button 
              onClick={() => handleStudyFC(flashcard)}
              className="hover:cursor-pointer flex-1 px-3 py-2 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
            >
              Study
            </button>
          </div>
        ))
      ) : (
        <div className="text-gray-500 mt-5">
            <h1>No flashcards found matching your search.</h1>
        </div>
      )}
      </div>

      {/* Delete Confirmation Modal - remains the same */}
      {showDeleteModal && flashcardToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Delete Flashcard Session
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{flashcardToDelete.fcsessionname}"? This action cannot be undone.
            </p>
            <div className="flex justify-between space-x-4">
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