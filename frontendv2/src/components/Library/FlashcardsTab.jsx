import React, { useState, useEffect } from 'react';
import { useUser } from '../authentication/UserContext';

const FlashcardsTab = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  }, [userId]);

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
              <button className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark">
                Study
              </button>
              <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsTab;