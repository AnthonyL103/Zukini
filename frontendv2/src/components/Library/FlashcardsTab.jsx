import React, { useState, useEffect } from 'react';
import { useUser } from '../authentication/UserContext';
import { useFC } from '../flashcards/FCcontext';
import { useScan } from '../scans/ScanContext';
import { useNavigate } from 'react-router-dom';

const FlashcardsTab = () => {
  const navigate = useNavigate();
  const { setCurrentFC, currentFC } = useFC();
  const { setCurrentScan } = useScan();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { userId } = useUser();


  useEffect(() => {
    const fetchFlashcards = async () => {
        try {
            const response = await fetch(`https://api.zukini.com/display/displayflashcards?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch flashcards');
            const data = await response.json();
            setFlashcardSets(data);
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        }
    };

    fetchFlashcards();
}, [userId, currentFC]); 

  const handleStudy = (flashcards) => {
    setCurrentFC(flashcards);
    getScan(flashcards.scankey);
    navigate('/study', { 
      state: { initialMode: 'flashcards' } 
    });
  };

  const getScan = async (scankey) => {
    if (!scankey) {
        console.error("scankey is missing");
        setCurrentScan(null); 
        return;
    }

    try {
        const response = await fetch(`https://api.zukini.com/scans/getscan?scankey=${scankey}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to fetch scan");

        const data = await response.json();

        if (!data.scan) {
            console.error("No scan found for scankey:", scankey);
            setCurrentScan(null); // Reset current scan if not found
            return;
        }

        setCurrentScan(data.scan);
        console.log("Scan retrieved successfully:", data.scan);
    } catch (error) {
        console.error("Error fetching scan:", error);
        setCurrentScan(null); 
    }
};


  const handleDelete = (set) => {
    setFlashcardToDelete(set);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!flashcardToDelete) {
      console.error("No flashcard selected for deletion.");
      return;
    }

    try {
      console.log("Deleting flashcard:", flashcardToDelete.flashcardkey);

      const response = await fetch(
        `https://api.zukini.com/display/deleteFC?userId=${userId}&key=${flashcardToDelete.flashcardkey}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete flashcard');

      setFlashcardSets((prevFlashcards) =>
        prevFlashcards.filter(fc => fc.flashcardkey !== flashcardToDelete.flashcardkey)
      );

      setShowDeleteModal(false);
      setFlashcardToDelete(null);
      setCurrentFC(null);
   
      fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const filteredSets = flashcardSets.filter(set =>
    set.fcsessionname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search flashcard sets..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSets.map((set) => (
          <div key={set.flashcardkey} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">{set.fcsessionname}</h3>
            <p className="text-gray-600 text-sm mb-4">
              From: {set.scanname}<br />
              Created: {new Date(set.date).toLocaleDateString()}
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleStudy(set)}
                className="hover:cursor-pointer flex-1 px-3 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-[#2c2099] transition-all text-sm font-semibold"
              >
                Study
              </button>
              <button 
                onClick={() => handleDelete(set)}
                className="hover:cursor-pointer flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
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

export default FlashcardsTab;
