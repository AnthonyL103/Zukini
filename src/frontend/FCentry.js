//md delete forever is just a visual icon
import AddFlashCards from "./AddFlashCards";
import {useState} from "react";

const FCentry = ({ flashcardkey, filepath, FlashCards, FCName, scanname, date, entryType, displayModal }) => {
  const [showStudyModal, setShowStudyModal] = useState(false);
  const handleDelete = () => {
    displayModal(flashcardkey, entryType);
    setShowStudyModal(false);
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
      <span><strong>Flashcard scan name:</strong> {scanname}</span>
      <span><strong>Flashcard study name:</strong> {FCName}</span>
      <span><strong>Date: <small>{date}</small></strong></span>
      
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
      
