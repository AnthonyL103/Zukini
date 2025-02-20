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
    const [VAFCName, setVAFCName] = useState("");
    const [viewAll, setShowViewAll] = useState(false);
    const { userId, setTotalFlashcards} = useUser();

    const scrollDelay = 7000; // Adjust this value to change delay time
    
    useEffect(() => {
        const fetchFC = async () => {
            try {
                const response = await fetch(`https://api.zukini.com/display/displayflashcards?userId=${userId}`);
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
            let endpoint = `https://api.zukini.com/display/deleteFC?userId=${userId}&key=${entryToDelete}`;
    
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
    
    const filteredVAFC = FCentries.filter(fc => 
        fc.fcsessionname.toLowerCase().includes(VAFCName.toLowerCase())
    );

    const displayedFC = FCName.trim()
        ? filteredFC.slice(0, itemsPerView)// Show all filtered scans when searching
        : FCentries.slice(startIndex, startIndex + itemsPerView);
        
    const scrolltoNext = () => {
        scroll();
        
    };
    const viewall = () => {
        setShowViewAll(true);
    }
    const closeviewall = () => {
        setShowViewAll(false);
    }
    
    return (
        <div
            ref={(el) => {
                if (!slidesRef.current) slidesRef.current = [];
                slidesRef.current[1] = el;
            }}
            className="relative h-full flex flex-col p-5 bg-indigo-900/40 rounded-xl mb-4 snap-start snap-always"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => FCName.trim() === "" && setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => FCName.trim() === "" && setIsPaused(false)}
        >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
                <p className="text-white font-semibold text-2xl">Flashcards:</p>
                <div className="flex w-2/3 justify-between">
                    <input
                        className="px-2 py-1 border-2 border-gray-300 rounded-lg text-gray-700 w-2/3 focus:border-blue-500 focus:ring focus:ring-blue-300"
                        value={FCName}
                        onChange={(e) => setFCName(e.target.value)}
                        placeholder="Search..."
                    />
                    <button
                        className="border-none flex w-1/3 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide rounded-lg transition-all duration-300 hover:bg-purple-300 hover:text-black"
                        onClick={viewall}
                    >
                        View All
                    </button>
                </div>
            </div>
    
            {/* Flashcard List */}
            <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 transition-opacity duration-500 ${isFading ? "opacity-0" : ""}`}>
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
                    <p className="text-white text-lg">No flashcards found.</p>
                )}
            </div>
    
            {/* View All Modal */}
            <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 transition-opacity duration-300 ${viewAll ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                {viewAll && (
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full h-full text-center overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-black font-semibold text-2xl">Flashcards:</p>
                            <input
                                className="px-2 py-1 border-2 border-gray-300 rounded-lg text-gray-700 w-2/3 focus:border-blue-500 focus:ring focus:ring-blue-300"
                                value={VAFCName}
                                onChange={(e) => setVAFCName(e.target.value)}
                                placeholder="Search scans..."
                            />
                        </div>
    
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {filteredVAFC.length > 0 ? (
                                filteredVAFC.map((entry) => (
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
                                        closeVA={closeviewall}
                                        viewall={viewall}
                                    />
                                ))
                            ) : (
                                <p className="text-black text-lg">No Flashcards found.</p>
                            )}
                        </div>
    
                        <div className="flex justify-around p-4">
                            <button
                                className="border-none flex w-1/3 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide rounded-lg transition-all duration-300 hover:bg-purple-300 hover:text-black"
                                onClick={closeviewall}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
    
            {/* View Mock Tests Button */}
            <div className="mt-auto py-4 flex justify-around">
                <button
                    className="border-none flex w-1/3 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide rounded-lg transition-all duration-300 hover:bg-purple-300 hover:text-black"
                    onClick={scrolltoNext}
                >
                    View Mocktests
                </button>
            </div>
    
            {/* Delete Confirmation Modal */}
            <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 transition-opacity duration-300 ${showModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                {showModal && (
                    <div className="bg-white rounded-xl shadow-lg p-6 w-1/2 text-center">
                        <h2 className="text-black font-bold text-2xl mb-4">Are you Sure?</h2>
                        <div className="flex justify-between">
                            <button
                                className="border-none flex w-1/3 px-4 py-2 bg-red-600 text-white font-bold uppercase tracking-wide rounded-lg transition-all duration-300 hover:bg-purple-300 hover:text-black"
                                onClick={handleDeleteEntry}
                            >
                                Yes
                            </button>
                            <button
                                className="border-none flex w-1/3 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide rounded-lg transition-all duration-300 hover:bg-purple-300 hover:text-black"
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
}  
    
export default PastFlashCardList;
