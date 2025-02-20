import { useState, useRef } from "react";
import StudyMenu from "../Header/StudyMenu";
import AddFlashCards from "../flashcards/AddFlashCards";
import AddMockTest from "../mocktests/AddMockTest";
import { useNavigate } from "react-router-dom";
import { useScan } from "../scans/ScanContext";
import PastFlashCardList from "../flashcards/PastFlashcardList";
import PastMocktestList from "../mocktests/PastMocktestList";

const Study = () => {
  const { currentScan, setCurrentScan } = useScan();
  const navigate = useNavigate();
  const [showFlashCards, setShowFlashCards] = useState(false);
  const [showMockTests, setShowMockTests] = useState(false);
  const [NewMTEntry, setNewMTEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [NewFCEntry, setNewFCEntry] = useState(null);
  const [clickedButton, setClickedButton] = useState(null);
  const slidesRef = useRef([]);

  const filepath = currentScan?.filepath || "";
  const scanname = currentScan?.scanname || "";
  const text = currentScan?.text || "";
  const date = currentScan?.date || "";

  const scrollToNextSlide = () => {
    const currentSlideIndex = slidesRef.current.findIndex(
      (slide) => slide.getBoundingClientRect().top >= 0
    );
    if (currentSlideIndex !== -1 && currentSlideIndex < slidesRef.current.length - 1) {
      slidesRef.current[currentSlideIndex + 1].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const scrollToTop = () => {
    slidesRef.current[0].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (!currentScan) {
    return (
      <div className="max-w-5xl h-[80vh] mt-[7dvh] mx-auto p-6 overflow-y-auto">
        <div ref={(el) => (slidesRef.current[0] = el)} className="flex flex-col p-6 bg-blue-900/40 rounded-lg">
          <p className="text-2xl font-semibold text-white">Study Page</p>
          <p className="text-lg text-gray-300">
            No scan selected. Please go back and choose a scan or a previous study.
          </p>
          <div className="flex justify-center mt-4">
            <button
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-purple-400 hover:text-black transition"
              onClick={() => navigate("/files")}
            >
              Select Scan
            </button>
          </div>
        </div>
        <PastFlashCardList NewFCEntry={NewFCEntry} scroll={scrollToNextSlide} slidesRef={slidesRef} />
        <PastMocktestList NewMTEntry={NewMTEntry} backtoTop={scrollToTop} slidesRef={slidesRef} />
      </div>
    );
  }

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
    setShowFlashCards(false);
    setIsLoading(false);
    setClickedButton(null);
  };

  const handleCloseMocktests = () => {
    setShowMockTests(false);
    setIsLoading(false);
    setClickedButton(null);
  };

  const goToSwitchScan = () => {
    setCurrentScan(null);
    localStorage.removeItem("currentScan");
    navigate("/files");
  };

  const onAddMockTest = (payload) => {
    setNewMTEntry(payload);
  };

  const onAddFlashCard = (payload) => {
    setNewFCEntry(payload);
  };

  return (
    <div className="max-w-5xl h-[80vh] mx-auto p-6 overflow-y-auto">
      <div ref={(el) => (slidesRef.current[0] = el)} className="flex flex-col p-6 bg-blue-900/40 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-semibold text-white">Study</p>
          <button
            className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-purple-400 hover:text-black transition"
            onClick={scrollToNextSlide}
          >
            View Saved
          </button>
        </div>

        {/* Notes Section */}
        <div className="bg-gray-200 p-4 rounded-lg overflow-y-auto h-60 text-lg">
          <span>
            <strong>Scan name:</strong> {scanname}
          </span>
          <br />
          <span>
            <strong>Date:</strong> <small>{date}</small>
          </span>
          <br />
          <span>
            <strong>Content:</strong>
          </span>
          <p>{text}</p>
        </div>

        {/* Study Menu */}
        <StudyMenu
          onCardsClick={handleGenerateFlashcards}
          onTestClick={handleGenerateMocktests}
          onSwitchScanClick={goToSwitchScan}
          clickedButton={clickedButton}
          isLoading={isLoading}
        />
      </div>

      {/* Flashcards & Mock Test Modals */}
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
          setisLoading={setIsLoading}
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
          setisLoading={setIsLoading}
        />
      )}

      <PastFlashCardList NewFCEntry={NewFCEntry} scroll={scrollToNextSlide} slidesRef={slidesRef} />
      <PastMocktestList NewMTEntry={NewMTEntry} backtoTop={scrollToTop} slidesRef={slidesRef} />
    </div>
  );
};

export default Study;
