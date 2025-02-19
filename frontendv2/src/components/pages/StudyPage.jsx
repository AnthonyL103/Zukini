import { useState, useRef } from 'react';
import StudyMenu from '../Header/StudyMenu';
import AddFlashCards from '../flashcards/AddFlashCards';
import AddMockTest from '../mocktests/AddMockTest';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../scans/ScanContext';
import PastFlashCardList from '../flashcards/PastFlashcardList';
import PastMocktestList from '../mocktests/PastMocktestList';

const Study = () => {
    const { currentScan, setCurrentScan } = useScan();
    const navigate = useNavigate();
    const [showFlashCards, setShowFlashCards] = useState(false);
    const [showMockTests, setShowMockTests] = useState(false);
    const [NewMTEntry, setNewMTEntry] = useState(null);
    const [NewFCEntry, setNewFCEntry] = useState(null);
    const [clickedButton, setClickedButton] = useState(null);
    
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
            block: "start",
            inline: "nearest",
        });
    };

    if (!currentScan) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-6xl mx-auto pt-[9dvh] px-4">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
                                Study
                            </h1>
                        </div>
    
                        <div className="bg-white p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] mb-8">
                            <p className="text-xl text-gray-700 mb-6">
                                No scan selected. Please go back and choose a scan or a previous study.
                            </p>
                            <div className="flex justify-center">
                                <button 
                                    onClick={() => navigate('/files')}
                                    className="px-8 py-4 bg-black text-white rounded-xl 
                                            hover:bg-primary hover:text-black transition-all duration-300 
                                            transform hover:-translate-y-1 active:translate-y-1"
                                >
                                    Select Scan
                                </button>
                            </div>
                        </div>
    
                    <PastFlashCardList 
                        NewFCEntry={NewFCEntry} 
                        scroll={scrollToNextSlide} 
                        slidesRef={slidesRef} 
                    />
    
                    <PastMocktestList 
                        NewMTEntry={NewMTEntry} 
                        backtoTop={scrollToTop} 
                        slidesRef={slidesRef} 
                    />
                </div>
            </div>
        );
    }

    const handleGenerateFlashcards = () => {
        setClickedButton("flashcards");
        setShowFlashCards(true);
    };

    const handleGenerateMocktests = () => {
        setClickedButton("mocktests");
        setShowMockTests(true);
    };

    const handleCloseFlashcards = () => {
        setShowFlashCards(false);
        setClickedButton(null);
    };

    const handleCloseMocktests = () => {
        setShowMockTests(false);
        setClickedButton(null);
    };

    const goToSwitchScan = () => {
        setCurrentScan(null);
        localStorage.removeItem('currentScan');
        navigate('/files');
    };

    const onAddMockTest = (payload) => {
        setNewMTEntry(payload);
    };

    const onAddFlashCard = (payload) => {
        setNewFCEntry(payload);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-6xl mx-auto pt-[9dvh] px-4">
                <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
                            Study
                        </h1>
                        <button 
                            className="px-8 py-4 bg-black text-white rounded-xl 
                                     hover:bg-primary hover:text-black transition-all duration-300 
                                     transform hover:-translate-y-1 active:translate-y-1"
                            onClick={scrollToNextSlide}
                        >
                            View Saved
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] mb-8">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center space-x-4">
                                <span className="text-primary font-semibold">Scan name:</span>
                                <span className="text-gray-700">{scanname}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-primary font-semibold">Date:</span>
                                <span className="text-gray-600"><small>{date}</small></span>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">Content:</h3>
                            <p className="text-gray-700 leading-relaxed">{text}</p>
                        </div>
                    </div>

                    <StudyMenu 
                        onCardsClick={handleGenerateFlashcards} 
                        onTestClick={handleGenerateMocktests} 
                        onSwitchScanClick={goToSwitchScan} 
                        clickedButton={clickedButton} 
                    />
                </div>

                {/* Existing modals and lists with updated styling */}
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

                <PastFlashCardList 
                    NewFCEntry={NewFCEntry} 
                    scroll={scrollToNextSlide} 
                    slidesRef={slidesRef} 
                />

                <PastMocktestList 
                    NewMTEntry={NewMTEntry} 
                    backtoTop={scrollToTop} 
                    slidesRef={slidesRef} 
                />
            </div>
        </div>
    );
};

export default Study;
