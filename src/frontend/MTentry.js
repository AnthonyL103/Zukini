//md delete forever is just a visual icon
import {useState} from "react";
import AddMockTest from "./AddMockTest";

const MTentry = ({ mocktestkey, filepath, Questions, scanname, date, entryType, displayModal }) => {
    const [showStudyModal, setShowStudyModal] = useState(false);
    const handleDelete = () => {
      displayModal(mocktestkey, entryType);
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
      <div className="MTentry">
        <span><strong>Mock Test study name:</strong> {scanname}</span>
        <br />
        <div className="MTentry-footer">
          <small>{date}</small>
          <div className="action-btn">
          <button className="study-button" onClick={handleStudy} >
            Study
          </button>
          <button className = "del-button" onClick={handleDelete}>
            Delete
          </button>
          </div>
        </div>
        {showStudyModal && (
        <AddMockTest
          filepath={filepath}
          scanname={scanname}
          text={""} // No text needed
          date={date}
          onClosePrevMT={handleclose}
          onDeletePrevMT={handleDelete} // Close function
          onAddMockTest={null} // Pass null if not needed
          Past= {true}
          prevMT = {Questions}
        />
      )}
      </div>
    );
  };
  
  export default MTentry;
        
  