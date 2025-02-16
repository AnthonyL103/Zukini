import { useState, useRef } from 'react';
import StudyMenu from '../StudyMenu';
import AddFlashCards from '../AddFlashCards';
import AddMockTest from '../AddMockTest';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../ScanContext';
import PastFlashCardList from '../PastFlashcardList';
import PastMocktestList from '../PastMocktestList';

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
            <div className="max-w-[1200px] h-[80dvh] md:h-[75dvh] p-6 mt-[1vh] mx-auto overflow-y-auto snap-y snap-mandatory">
                <div ref={(el) => slidesRef.current[0] = el} className="relative flex flex-col h-full p-6 bg-[rgba(15,6,71,0.4)] rounded-xl mb-4 snap-start">
                    <p className="text-white text-[clamp(1.5rem,3vw,2.5rem)] font-semibold">Study Page</p>
                    <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5">No scan selected. Please go back and choose a scan or a previous study.</p>
                    <div className="flex justify-center w-full mt-4">
                        <button 
                            className="w-1/3 h-[10dvh] bg-black text-white font-bold uppercase rounded-xl transition-all duration-300 hover:bg-purple-300 hover:text-black active:translate-y-2"
                            onClick={() => navigate('/files')}>
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
        <div className="max-w-[1200px] h-[80dvh] md:h-[75dvh] p-6 mt-[1vh] mx-auto overflow-y-auto snap-y snap-mandatory">
            <div ref={(el) => slidesRef.current[0] = el} className="relative flex flex-col h-full p-6 bg-[rgba(15,6,71,0.4)] rounded-xl mb-4 snap-start">
                <div className="flex justify-between items-center">
                    <p className="text-black text-[clamp(1.5rem,3vw,2.5rem)] font-semibold">Study</p>
                    <button className="w-[30dvh] min-h-[5vw] bg-black text-white font-bold uppercase rounded-xl transition-all duration-300 hover:bg-purple-300 hover:text-black active:translate-y-2"
                        onClick={scrollToNextSlide}>
                        View Saved
                    </button>
                </div>

                <div className="bg-[#deded8] rounded-xl p-4 text-lg h-[60dvh] flex flex-col overflow-y-auto">
                    <span><strong>Scan name:</strong> {scanname}</span>
                    <span><strong>Date:</strong> <small>{date}</small></span>
                    <br />
                    <span><strong>Content:</strong></span>
                    <span>{text}</span>
                </div>

                <StudyMenu 
                    onCardsClick={handleGenerateFlashcards} 
                    onTestClick={handleGenerateMocktests} 
                    onSwitchScanClick={goToSwitchScan} 
                    clickedButton={clickedButton} 
                />
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
    );
};

export default Study;
