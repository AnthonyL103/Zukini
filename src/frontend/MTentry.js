//md delete forever is just a visual icon


const MTentry = ({ mocktestkey, filepath, scanname, date, entryType, displayModal }) => {
    const handleDelete = () => {
      displayModal(mocktestkey, entryType);
    };
    
    return (
      <div className="MTentry">
        <span><strong>Mock Test study name:</strong> {scanname}</span>
        <br />
        <div className="MTentry-footer">
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
  
  export default MTentry;
        
  