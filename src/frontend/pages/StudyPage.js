import React, { useState } from 'react';
import StudyMenu from '../StudyMenu';
import AddFlashCards from '../AddFlashCards';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../ScanContext';

const Study = () => {
  const { currentScan } = useScan(); // Access global state for the current scan
  const navigate = useNavigate();
  const [showFlashCards, setShowFlashCards] = useState(false); // State to control rendering AddFlashCards

  if (!currentScan) {
    return (
      <div className="container">
        <h1>Study</h1>
        <p>No scan selected. Please go back and choose a scan. Or a previous study</p>
        <button className="study-button" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const { filepath, scanname, text, date } = currentScan; // Destructure the scan data

  // Trigger to show AddFlashCards component
  const handleGenerateFlashcards = () => {
    setShowFlashCards(true);
  };
  
  const handleCloseFlashcards = () => {
    setShowFlashCards(false); // Close modal and reset
  };
  
  const goToSwitchScan =() => {
    navigate('/files');
  }

  const goToTest = () => {
    navigate('/test');
  };
  //showflash cards is the condition representing if we should render addflashcards.js or not
  return (
    <div className="container">
      <h1>Study: {scanname}</h1>
      <p><strong>Date:</strong> {date}</p>
      <div>
        <h2>Notes:</h2>
        <p>{text}</p>
      </div>
      <StudyMenu onCardsClick={handleGenerateFlashcards} onTestClick={goToTest} onSwitchScanClick={goToSwitchScan} />
      {showFlashCards && (
        <AddFlashCards
          filepath={filepath}
          scanname={scanname}
          text={text}
          date={date}
          onClose={handleCloseFlashcards}
        />
      )}
    </div>
  );
};

export default Study;
