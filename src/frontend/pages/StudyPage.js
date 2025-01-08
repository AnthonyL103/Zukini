import React from 'react';
import StudyMenu from '../StudyMenu';
import AddFlashCards from '../AddFlashCards';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../ScanContext';

const Study = () => {
  const { currentScan } = useScan(); // Access global state for the current scan
  const navigate = useNavigate();
  
  

  // Handle case where no scan is selected
  if (!currentScan) {
    return (
      <div className="container">
        <h1>Study</h1>
        <p>No scan selected. Please go back and choose a scan.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const { filepath, scanname, text, date } = currentScan; // Destructure the scan data
  
  const handleGenerateFlashcards = async () => {
    try {
      const flashcards = await AddFlashCards({ filepath, scanname, text, date });
      console.log('Generated Flashcards:', flashcards);

      // Navigate to the Cards page with generated flashcards
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    }
  };
  
  const goToTest = () => {
    navigate('/test');
  };

  return (
    <div className="container">
      <h1>Study: {scanname}</h1>
      <p><strong>Date:</strong> {date}</p>
      <div>
        <h2>Notes:</h2>
        <p>{text}</p>
      </div>
      <StudyMenu onCardsClick={handleGenerateFlashcards} onTestClick={goToTest}/> 
    </div>
  );
};

export default Study;
