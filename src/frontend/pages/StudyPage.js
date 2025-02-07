import React, { useState } from 'react';
import StudyMenu from '../StudyMenu';
import PastStudy from '../PastStudy';
import AddFlashCards from '../AddFlashCards';
import AddMockTest from '../AddMockTest';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../ScanContext';
import Authentication from '../Authentication';

const Study = () => {
const { currentScan, setCurrentScan } = useScan(); // Access global state for the current scan
const navigate = useNavigate();
const [showFlashCards, setShowFlashCards] = useState(false); // State to control rendering AddFlashCards
const [showMockTests, setShowMockTests] = useState(false); // State to control rendering AddFlashCards
const [NewMTEntry, setNewMTEntry, ] = useState(null)
const [NewFCEntry, setNewFCEntry, ] = useState(null)
const [clickedButton, setClickedButton] = useState(null); // Track which button was clicked


  if (!currentScan) {
    return (
      <div className="container">
        <div className="header-wrapper">
            <h1>Study:</h1>
            <Authentication/>
        </div>
        <p>No scan selected. Please go back and choose a scan. Or a previous study</p>
        <button className="goback-button" onClick={() => navigate('/files')}>Select Scan</button>
        <PastStudy />
      </div>
      
    );
  }

  const { filepath, scanname, text, date } = currentScan; // Destructure the scan data

  // Trigger to show AddFlashCards component
  const handleGenerateFlashcards = () => {
    setClickedButton("flashcards");
    setShowFlashCards(true);
  };
  
  const handleGenerateMocktests = () => {
    setClickedButton("mocktests");
    setShowMockTests(true);
  };
  
  const handleCloseFlashcards = () => {
    setShowFlashCards(false); // Close modal and reset
    setClickedButton(null);
  };
  
  const handleCloseMocktests = () => {
    setShowMockTests(false); // Close modal and reset
    setClickedButton(null);
  };
  
  const goToSwitchScan =() => {
    //clear curr scan
    setCurrentScan(null);
    localStorage.removeItem('currentScan');
    navigate('/files');
  }
  
  const onAddMockTest =(payload) => {
    setNewMTEntry(payload);
  };
  const onAddFlashCard =(payload) => {
    setNewFCEntry(payload);
  };

  //showflash cards is the condition representing if we should render addflashcards.js or not
  return (
    <div className="container">
        <div className="header-wrapper">
            <h1>Study: {scanname}</h1>
            <Authentication/>
        </div>
      
      <p><strong>Date:</strong> {date}</p>
      <div>
        <h2>Notes:</h2>
        <p>{text}</p>
      </div>
      <StudyMenu onCardsClick={handleGenerateFlashcards} onTestClick={handleGenerateMocktests} onSwitchScanClick={goToSwitchScan} clickedButton={clickedButton}  />
      {showFlashCards && (
        <AddFlashCards
          filepath={filepath}
          scanname={scanname}
          text={text}
          date={date}
          onClose={handleCloseFlashcards}
          onAddFlashCard={onAddFlashCard}
          Past={false}
          prevFC={null}
        />
      )}
      {showMockTests && (
        <AddMockTest
          filepath={filepath}
          scanname={scanname}
          text={text}
          date={date}
          onClose={handleCloseMocktests}
          onAddMockTest={onAddMockTest}
          Past={false}
          prevMT={null}
        />
        )}
    <PastStudy NewMTEntry={NewMTEntry} NewFCEntry={NewFCEntry}/>
    </div>
  );
};

export default Study;
