import { useState, useRef } from 'react';
import StudyMenu from '../Header/StudyMenu';
import AddFlashCards from '../flashcards/AddFlashCards';
import AddMockTest from '../mocktests/AddMockTest';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../scans/ScanContext';
import PastFlashCardList from '../flashcards/PastFlashcardList';
import PastMocktestList from '../mocktests/PastMocktestList';


const Study = () => {
    const { currentScan, setCurrentScan } = useScan(); // Access global state for the current scan
    const navigate = useNavigate();
    const [showFlashCards, setShowFlashCards] = useState(false); // State to control rendering AddFlashCards
    const [showMockTests, setShowMockTests] = useState(false); // State to control rendering AddFlashCards
    const [NewMTEntry, setNewMTEntry] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const [NewFCEntry, setNewFCEntry, ] = useState(null)
    const [clickedButton, setClickedButton] = useState(null); // Track which button was clicked
    const filepath = currentScan?.filepath || "";
    const scanname = currentScan?.scanname || "";
    const text = currentScan?.text || "";
    const date = currentScan?.date || "";


    const slidesRef = useRef([]);

    const scrollToNextSlide = () => {
        const currentSlideIndex = slidesRef.current.findIndex(slide =>
            slide.getBoundingClientRect().top >= 0
        );

        if (currentSlideIndex !== -1 && currentSlideIndex < slidesRef.current.length - 1) {
            slidesRef.current[currentSlideIndex + 1].scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }

    };

    const scrollToTop = () => {
        slidesRef.current[0].scrollIntoView({
        behavior: "smooth",
        block: "start", // Ensures it aligns properly with snap
        inline: "nearest",
        });
    };

  if (!currentScan) {
    return (
      <div className="studycontainer">
        <div ref={(el) => slidesRef.current[0] = el}  className="studypagecont">
            <p className="homepagecont-title">Study Page</p>
            <p className="homepagecont-body">No scan selected. Please go back and choose a scan. Or a previous study</p>
            <div className="addscanwrap">
            <button className="nav-button" onClick={() => navigate('/files')}>Select Scan</button>
            </div>
        </div>
        <PastFlashCardList NewFCEntry={NewFCEntry} scroll={scrollToNextSlide} slidesRef={slidesRef}/>
        <PastMocktestList NewMTEntry={NewMTEntry} backtoTop={scrollToTop} slidesRef={slidesRef}/>
      </div>
      
    );
  }

  
  

  // Trig to show AddFlashCards component
  const handleGenerateFlashcards = () => {
    setClickedButton("flashcards");
    setIsLoading(true);
    setShowFlashCards(true);
  };
  
  const handleGenerateMocktests = () => {
    setClickedButton("mocktests");
    setIsLoading(true);
    setShowMockTests(true);
  };
  
  const handleCloseFlashcards = () => {
    setShowFlashCards(false); // Close modal and reset
    setIsLoading(false);
    setClickedButton(null);
  };
  
  const handleCloseMocktests = () => {
    setShowMockTests(false); // Close modal and reset
    setIsLoading(false);
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
    <div  className="studycontainer">
        <div ref={(el) => slidesRef.current[0] = el} className="studypagecont">
            <div className="scanheaderwrapper">
            <p className="scans-title">Study</p>
            <button className="viewpast-button" onClick={scrollToNextSlide}>View Saved</button>
                
            </div>
         <div className="notesholder">
            <span><strong>Scan name:</strong> {scanname}</span>
            <span><strong>Date: <small>{date}</small></strong></span>
            <br />
            <span><strong>Content:</strong></span>
                <span>{text}</span>
        </div>
         <StudyMenu onCardsClick={handleGenerateFlashcards} onTestClick={handleGenerateMocktests} onSwitchScanClick={goToSwitchScan} clickedButton={clickedButton} isLoading = {isLoading}/>
         
        </div>
      
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
        
    <PastFlashCardList NewFCEntry={NewFCEntry} scroll={scrollToNextSlide} slidesRef={slidesRef}/>
    <PastMocktestList NewMTEntry={NewMTEntry} backtoTop={scrollToTop} slidesRef={slidesRef}/>
    
    </div>
  );
};

export default Study;
