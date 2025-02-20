import { useState, useEffect } from "react";
import MTentry from "../mocktests/MTentry";
import { useUser } from '../authentication/UserContext';


const PastMocktestList = ({NewMTEntry, backtoTop, slidesRef}) => {
    const [MTentries, setMTentries] = useState([]);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [entryType, setEntryType] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false); 
    const [isPaused, setIsPaused] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(window.innerWidth < 768 ? 1 : 2);
    const [MTName, setMTName] = useState("");
    const [VAMTName, setVAMTName] = useState("");
    const [viewAll, setShowViewAll] = useState(false);
    const { userId, setTotalMockTests} = useUser();

    const scrollDelay = 7000; // Adjust this value to change delay time
    
    useEffect(() => {
        
        
        const fetchMT = async () => {
            try {
                const response = await fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`);
                if (!response.ok) {
                  throw new Error('Failed to fetch mt');
                }
                const data = await response.json();
                console.log('Fetched mt:', data);
                setMTentries(data);
              } catch (error) {
                console.error('Error fetching mt:', error);
              }
        };
        
        fetchMT();
    }, [userId])
    
    useEffect(() => {
        if (NewMTEntry) {
            setMTentries((prev) => [...prev, NewMTEntry]);
        }
    }, [NewMTEntry]);
    
    useEffect(() => {
        setTotalMockTests(MTentries.length);
    }, [MTentries, setTotalMockTests]);
    
    
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
            let endpoint = `https://api.zukini.com/display/deleteMT?userId=${userId}&key=${entryToDelete}`;
    
            const response = await fetch(endpoint, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete ${entryType}`);
            }
            
            setMTentries((prev) => {
                const updatedMTentries = prev.filter((entry) => entry.mocktestkey !== entryToDelete);
                return updatedMTentries;
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

    useEffect(() => {
        if (MTentries.length > 0 && startIndex >= MTentries.length) {
            setStartIndex(0);
        }
    }, [MTentries, startIndex]);

    // Pause scrolling when searching
    useEffect(() => {
        if (MTName.trim() !== "") {
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
    }, [MTName]);

    // Auto-scroll effect
    useEffect(() => {
        if (isStudyModalOpen) {
            console.log(isStudyModalOpen)
            setIsPaused(true);
            return; 
        }
        if (isPaused) return;
        if (MTentries.length < 3) return;

        const interval = setInterval(() => {
            setIsFading(true); // Start fade-out effect
            setTimeout(() => {
                setStartIndex((prevIndex) =>
                    prevIndex + itemsPerView >= MTentries.length ? 0 : prevIndex + itemsPerView
                );
                setIsFading(false); // Start fade-in effect
            }, 1000); // 1s fade transition
        }, scrollDelay);

        return () => clearInterval(interval); // Cleanup interval
    }, [MTentries, scrollDelay, isPaused, itemsPerView, isStudyModalOpen]);

    // Filter mock tests based on search
    const filteredMT = MTentries.filter(mt =>
        mt.mtsessionname.toLowerCase().includes(MTName.toLowerCase())
    );
    
    const filteredVAMT = MTentries.filter(mt => 
        mt.mtsessionname.toLowerCase().includes(VAMTName.toLowerCase())
    );

    const displayedMT = MTName.trim()
        ? filteredMT.slice(0, itemsPerView) // Show all filtered mock tests when searching
        : MTentries.slice(startIndex, startIndex + itemsPerView);
    
    const back = () => {
        backtoTop();
    }
    
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
                slidesRef.current[2] = el;
            }}
            className="relative h-full flex flex-col p-5 bg-indigo-900/40 rounded-xl mb-4 snap-start snap-always"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => MTName.trim() === "" && setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => MTName.trim() === "" && setIsPaused(false)}
        >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
                <p className="text-white font-semibold text-2xl">Mocktests:</p>
                <div className="flex w-2/3 justify-between">
                    <input
                        className="px-2 py-1 border-2 border-gray-300 rounded-lg text-gray-700 w-2/3 focus:border-blue-500 focus:ring focus:ring-blue-300"
                        value={MTName}
                        onChange={(e) => setMTName(e.target.value)}
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

            {/* Mock Test List */}
            <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 transition-opacity duration-500 ${isFading ? "opacity-0" : ""}`}>
                {displayedMT.length > 0 ? (
                    displayedMT.map((entry) => (
                        <MTentry
                            key={entry.mocktestkey}
                            mocktestkey={entry.mocktestkey}
                            filepath={entry.filepath}
                            scanname={entry.scanname}
                            Questions={entry.questions}
                            MTName={entry.mtsessionname}
                            date={entry.date}
                            entryType="mocktest"
                            displayModal={displayModal}
                            pausescroll={setIsStudyModalOpen}
                        />
                    ))
                ) : (
                    <p className="text-white text-lg">No mock tests found.</p>
                )}
            </div>

            {/* View All Modal */}
            <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 transition-opacity duration-300 ${viewAll ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                {viewAll && (
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full h-full text-center overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-black font-semibold text-2xl">Mocktests:</p>
                            <input
                                className="px-2 py-1 border-2 border-gray-300 rounded-lg text-gray-700 w-2/3 focus:border-blue-500 focus:ring focus:ring-blue-300"
                                value={VAMTName}
                                onChange={(e) => setVAMTName(e.target.value)}
                                placeholder="Search scans..."
                            />
                        </div>

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {filteredVAMT.length > 0 ? (
                                filteredVAMT.map((entry) => (
                                    <MTentry
                                        key={entry.mocktestkey}
                                        mocktestkey={entry.mocktestkey}
                                        filepath={entry.filepath}
                                        scanname={entry.scanname}
                                        Questions={entry.questions}
                                        MTName={entry.mtsessionname}
                                        date={entry.date}
                                        entryType="mocktest"
                                        displayModal={displayModal}
                                        pausescroll={setIsStudyModalOpen}
                                        closeVA={closeviewall}
                                        viewall={viewall}
                                    />
                                ))
                            ) : (
                                <p className="text-black text-lg">No Mocktests found.</p>
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

            {/* Go Back Button */}
            <div className="mt-auto py-4 flex justify-around">
                <button
                    className="border-none flex w-1/3 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide rounded-lg transition-all duration-300 hover:bg-purple-300 hover:text-black"
                    onClick={back}
                >
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 384 512">
                        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
                    </svg>
                    Back
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
};

export default PastMocktestList;
