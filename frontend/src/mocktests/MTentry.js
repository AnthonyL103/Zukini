//md delete forever is just a visual icon
import {useState, useEffect} from "react";
import AddMockTest from "./AddMockTest";

const MTentry = ({ mocktestkey, filepath, Questions, MTName, scanname, date, entryType, displayModal, pausescroll, viewall, closeVA }) => {
    const [showStudyModal, setShowStudyModal] = useState(false);
    
    useEffect(() => {
        pausescroll(showStudyModal);
    }, [showStudyModal]);
      
    
    const handleDelete = () => {
      displayModal(mocktestkey, entryType);
      pausescroll(false);
    };
    
    const handleclose = () => {
        if (viewall) {
            closeVA();
        }
        setShowStudyModal(false);
        console.log(showStudyModal);
      };
      
    const handleStudy = () => {
        setShowStudyModal(true);
        console.log(showStudyModal);
      };
    
    return (
      <div className="MTentry">
        <p className="studyEntryTitle">Mock Test study name: {MTName}</p>
        <p className="studyEntrybody">Mock Test scan name: {scanname}</p>
        <p className="studyEntrybody">Date: {date} </p>
        <div className="MTentry-footer">
          <button className="study-button" onClick={handleStudy} >
            Study
          </button>
          <button className = "del-button" onClick={handleDelete}>
            Delete
          </button>
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
        
  