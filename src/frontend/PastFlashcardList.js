import { useState, useEffect } from "react";
import FCentry from "./FCentry";
import { useUser } from './UserContext';


const PastFlashCardList = ({NewFCEntry, scroll, slidesRef}) => {
    const [FCentries, setFCentries] = useState([]);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [entryType, setEntryType] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false); 
    const [itemsPerView, setItemsPerView] = useState(window.innerWidth < 768 ? 1 : 2);
    const [FCName, setFCName] = useState("");
    const { userId, setTotalFlashcards} = useUser();

    const scrollDelay = 7000; // Adjust this value to change delay time
    
    useEffect(() => {
        const fetchFC = async () => {
            try {
                const response = await fetch(`http://18.236.227.203:5001/displayflashcards?userId=${userId}`);
                if (!response.ok) {
                  throw new Error('Failed to fetch fc');
                }
                const data = await response.json();
                console.log('Fetched fc:', data);
                setFCentries(data);
              } catch (error) {
                console.error('Error fetching fc:', error);
              }
        };
        
        fetchFC();
    }, [userId])
    
    useEffect(() => {
        if (NewFCEntry) {
            setFCentries((prev) => {
                const updatedFCentries = [...prev, NewFCEntry];
                setTotalFlashcards(updatedFCentries.length); // 
                return updatedFCentries; 
            });
        }
    }, [NewFCEntry]);
    
    

    
    const displayModal = (key, type) => {
        console.log("made it");
        setEntryToDelete(key);
        setEntryType(type);
        setShowModal(true);
        console.log(key);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setEntryToDelete(null);
        setEntryType(null);
    };
    
    const handleDeleteEntry = async () => {
        try {
            let endpoint = "http://18.236.227.203:5001/deleteFC";

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, key: entryToDelete }),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete ${entryType}`);
            }

            
            setFCentries((prev) => {
                const updatedFCentries = prev.filter((entry) => entry.flashcardkey !== entryToDelete);
                setTotalFlashcards(updatedFCentries.length); 
                return updatedFCentries; 
            });

            console.log(`${entryType} deleted successfully:`, entryToDelete);
            setShowModal(false);
        } catch (error) {
            console.error(`Error deleting ${entryType}:`, error);
        }
    };
    

    // Adjust `itemsPerView` based on screen size
    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(window.innerWidth < 768 ? 1 : 2);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [itemsPerView]);

    // Pause scrolling when searching
    useEffect(() => {
        if (FCName.trim() !== "") {
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
        
    }, [FCName]);
    
    useEffect(() => {
        if (FCentries.length > 0 && startIndex >= FCentries.length) {
            setStartIndex(0); 
        }
    }, [FCentries, startIndex]);
    

    // Auto-scroll effect
    useEffect(() => {
        if (isStudyModalOpen) {
            console.log(isStudyModalOpen)
            setIsPaused(true);
            return; 
        }
        if (isPaused) return;
        if (FCentries.length < 3) return;

        const interval = setInterval(() => {
            setIsFading(true); // Start fade-out effect
            setTimeout(() => {
                setStartIndex((prevIndex) =>
                    prevIndex + itemsPerView >= FCentries.length ? 0 : prevIndex + itemsPerView
                );
                setIsFading(false); // Start fade-in effect
            }, 1000); // 1s fade transition
        }, scrollDelay);

        return () => clearInterval(interval); // Cleanup interval
    }, [FCentries, scrollDelay, isPaused, itemsPerView, isStudyModalOpen]);

    // Filter flashcards based on search
    const filteredFC = FCentries.filter(fc =>
        fc.fcsessionname.toLowerCase().includes(FCName.toLowerCase())
    );

    const displayedFC = FCName.trim()
        ? filteredFC.slice(0, itemsPerView)// Show all filtered scans when searching
        : FCentries.slice(startIndex, startIndex + itemsPerView);
        
    const scrolltoNext = () => {
        scroll();
        
    };

    return (
        <div ref={(el) => {
            if (!slidesRef.current) slidesRef.current = [];
            slidesRef.current[1] = el; 
        }} className="studypagecont"
            onMouseEnter={() => setIsPaused(true)}  
            onMouseLeave={() => FCName.trim() === "" && setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}  // Pause scrolling on touch (Mobile)
            onTouchEnd={() => FCName.trim() === "" && setIsPaused(false)} // Resume scrolling on release (Mobile)
            >
            <div className="scanheaderwrapper">
                <p className="scans-title">Flashcards:</p>
                <input 
                    className="scansnameinput"
                    value={FCName}
                    onChange={(e) => setFCName(e.target.value)}
                    placeholder="Search scans..."
                />
            </div>

            <div className={`FCentries-list ${isFading ? "fade" : ""}`}>
                {displayedFC.length > 0 ? (
                    displayedFC.map((entry) => (
                        <FCentry
                            key={entry.flashcardkey}
                            flashcardkey={entry.flashcardkey}
                            filepath={entry.filepath}
                            scanname={entry.scanname}
                            FlashCards={entry.flashcards}
                            FCName={entry.fcsessionname}
                            date={entry.date}
                            entryType="flashcard"
                            displayModal={displayModal}
                            pausescroll= {setIsStudyModalOpen}
                        />
                    ))
                ) : (
                    <p className="nosearch">No flashcards found.</p>
                )}
            </div>
            
            <div className="addscanwrap">
                <button className="addscan-button" onClick={scrolltoNext}>View Mocktests</button>
            </div>
            
            <div className={`deleteWarn-container ${showModal ? "show" : ""}`}>
            {showModal && (
            <div className="deleteWarn-modal">
            <h2 className="deleteWarn-heading">Are you Sure?</h2>
            <div className="deleteWarnbutton-wrapper">
                <button
                className="deleteWarn-button" // Updated to match CSS
                onClick={handleDeleteEntry}
                >
                Yes
                </button>
                <button
                className="deleteWarn-buttoncancel" // Updated to match CSS
                onClick={handleCloseModal}
                >
                No
                </button>
                </div>
            </div>
            )}
        
            </div>
        </div>
    );
};

export default PastFlashCardList;
