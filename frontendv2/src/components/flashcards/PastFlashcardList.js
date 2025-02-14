import { useState, useEffect } from "react";
import FCentry from "./FCentry";
import { useUser } from '../authentication/UserContext';


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
            setFCentries((prev) => [...prev, NewFCEntry]);
        }
    }, [NewFCEntry]);
    
    useEffect(() => {
        setTotalFlashcards(FCentries.length);
    }, [FCentries, setTotalFlashcards]);
    
    
    

    
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
            let endpoint = `http://18.236.227.203:5001/deleteFC?userId=${userId}&key=${entryToDelete}`;
    
            const response = await fetch(endpoint, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete ${entryType}`);
            }
    
            setFCentries((prev) => {
                const updatedFCentries = prev.filter((entry) => entry.flashcardkey !== entryToDelete);
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
        <div 
            ref={(el) => {
                if (!slidesRef.current) slidesRef.current = [];
                slidesRef.current[1] = el; 
            }}
            className="relative h-full flex flex-col p-5 bg-overlay rounded-2xl mb-4 scroll-snap-start scroll-snap-stop-always"
            onMouseEnter={() => setIsPaused(true)}  
            onMouseLeave={() => FCName.trim() === "" && setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => FCName.trim() === "" && setIsPaused(false)}
        >
            <div className="w-full h-auto flex items-center justify-between mb-4">
                <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-white mt-[5px]">
                    Flashcards:
                </p>
                <input 
                    className="p-[5px] border-2 border-gray-300 w-[30vw] min-h-[2vw] rounded-2xl text-base text-gray-600 outline-none"
                    value={FCName}
                    onChange={(e) => setFCName(e.target.value)}
                    placeholder="Search..."
                />
            </div>
    
            <div className={`grid gap-4 grid-cols-[repeat(auto-fit,minmax(400px,1fr))] transition-opacity duration-500 ease-in-out ${isFading ? "opacity-0" : ""} md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]`}>
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
                            pausescroll={setIsStudyModalOpen}
                        />
                    ))
                ) : (
                    <p className="text-[clamp(1rem,2vw,2rem)] text-white">No flashcards found.</p>
                )}
            </div>
            
            <div className="mt-auto pt-[1vw] pb-[1vw] static flex justify-around items-center w-full">
                <button 
                    onClick={scrolltoNext}
                    className="w-[30%] h-[6dvh] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl shadow-[0px_0px_0px_4px_rgba(180,160,255,0.253)] transition-all duration-600 hover:bg-primary-hover hover:text-black"
                >
                    View Mocktests
                </button>
            </div>
            
            <div className={`fixed inset-0 bg-black/30 flex items-center justify-center ${showModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                {showModal && (
                    <div className="bg-white w-1/2 rounded-2xl shadow-md p-8 text-center">
                        <h2 className="text-black font-bold">Are you Sure?</h2>
                        <div className="w-full h-auto flex items-center justify-between gap-5">
                            <button
                                onClick={handleDeleteEntry}
                                className="w-[48%] border-none flex px-6 py-3 bg-danger text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="w-[48%] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
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
