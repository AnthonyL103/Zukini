//md delete forever is just a visual icon
import AddFlashCards from "./AddFlashCards";
import {useState, useEffect} from "react";

const FCentry = ({ flashcardkey, filepath, FlashCards, FCName, scanname, date, entryType, displayModal, pausescroll}) => {
  const [showStudyModal, setShowStudyModal] = useState(false);
  
  useEffect(() => {
    pausescroll(showStudyModal);
  }, [showStudyModal]);
  
  const handleDelete = () => {
    displayModal(flashcardkey, entryType);
    pausescroll(false);
  };
  
  const handleclose = () => {
    setShowStudyModal(false);
    console.log(showStudyModal);
  };
  
  const handleStudy = () => {
    setShowStudyModal(true);
    console.log(showStudyModal);
  };
  
  return (
    <div className="FCentry">
        <p className="studyEntryTitle">Flashcards study name: {FCName}</p>
        <p className="studyEntrybody">Flashcards scan name: {scanname}</p>
        <p className="studyEntrybody">Date: {date} </p>
      
      <div className="FCentry-footer">
        <button className="study-button" onClick={handleStudy}>
          Study
        </button>
        <button className = "del-button" onClick={handleDelete}>
          Delete
        </button>
    </div>
      {showStudyModal && (
        <AddFlashCards
          filepath={filepath}
          scanname={scanname}
          text={""} // No text needed
          date={date}
          onClosePrevFC={handleclose}
          onDeletePrevFC={handleDelete} // Close function
          onAddFlashCard={null} // Pass null if not needed
          Past= {true}
          prevFC = {FlashCards}
        />
      )}
    </div>
  );
};

export default FCentry;
      
