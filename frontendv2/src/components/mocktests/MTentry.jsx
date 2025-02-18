//md delete forever is just a visual icon
import {useState, useEffect} from "react";
import AddMockTest from "./AddMockTest";

const MTentry = ({ mocktestkey, filepath, Questions, MTName, scanname, date, entryType, displayModal, pausescroll }) => {
    const [showStudyModal, setShowStudyModal] = useState(false);
    
    useEffect(() => {
        pausescroll(showStudyModal);
    }, [showStudyModal]);
      
    
    const handleDelete = () => {
      displayModal(mocktestkey, entryType);
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
        <div className="bg-surface rounded-2xl p-4 text-lg h-[60dvh] flex flex-col overflow-auto relative touch-manipulation">
            <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-black mt-[5px]">
                Mock Test name: {MTName}
            </p>
            <p className="mt-5 text-[clamp(1rem,2vw,2rem)] text-black">
                Mock Test scan name: {scanname}
            </p>
            <p className="mt-5 text-[clamp(1rem,2vw,2rem)] text-black">
                Date: {date}
            </p>
          
            <div className="mt-auto flex justify-between sticky bottom-0">
                <button 
                    className="w-[48%] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                    onClick={handleStudy}
                >
                    Study
                </button>
                <button 
                    className="w-[48%] border-none flex px-6 py-3 bg-danger text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </div>
    
            {showStudyModal && (
                <AddMockTest
                    filepath={filepath}
                    scanname={scanname}
                    text={""}
                    date={date}
                    onClosePrevMT={handleclose}
                    onDeletePrevMT={handleDelete}
                    Past={true}
                    prevMT={Questions}
                />
            )}
        </div>
    );
  };
  
  export default MTentry;
        
  