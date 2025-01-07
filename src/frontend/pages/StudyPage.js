import React from 'react';
import StudyMenu from '../StudyMenu';
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

  const { scanname, text, date } = currentScan; // Destructure the scan data
  
  const goToCards = () => {
    navigate('/cards');
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
      <StudyMenu onCardsClick={goToCards} onTestClick={goToTest}/> {/* Your existing study menu component */}
    </div>
  );
};

export default Study;
