//md delete forever is just a visual icon


const FCentry = ({ flashcardkey, filepath, scanname, date, entryType, displayModal }) => {
  const handleDelete = () => {
        displayModal(flashcardkey, entryType);
  };
  
  return (
    <div className="FCentry">
      <span><strong>Flashcard study name:</strong> {scanname}</span>
      <br />
      <div className="FCentry-footer">
        <small>{date}</small>
        <div className="action-btn">
        <button className="study-button" >
          Study
        </button>
        <button className = "del-button" onClick={handleDelete}>
          Delete
        </button>
        </div>
      </div>
    </div>
  );
};

export default FCentry;
      
