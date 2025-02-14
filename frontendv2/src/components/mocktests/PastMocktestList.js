import { useState, useEffect } from "react";
import MTentry from "../MTentry";
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
    const { userId, setTotalMockTests} = useUser();

    const scrollDelay = 7000; // Adjust this value to change delay time
    
    useEffect(() => {
        
        
        const fetchMT = async () => {
            try {
                const response = await fetch(`http://18.236.227.203:5001/displaymocktests?userId=${userId}`);
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
            let endpoint = `http://18.236.227.203:5001/deleteMT?userId=${userId}&key=${entryToDelete}`;
    
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

    const displayedMT = MTName.trim()
        ? filteredMT.slice(0, itemsPerView) // Show all filtered mock tests when searching
        : MTentries.slice(startIndex, startIndex + itemsPerView);
    
    const back = () => {
        backtoTop();
    }

    return (
        <div 
            ref={(el) => {
                if (!slidesRef.current) slidesRef.current = [];
                slidesRef.current[2] = el;
            }}
            className="relative h-full flex flex-col p-5 bg-overlay rounded-2xl mb-4 scroll-snap-start scroll-snap-stop-always"
            onMouseEnter={() => setIsPaused(true)}  
            onMouseLeave={() => MTName.trim() === "" && setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => MTName.trim() === "" && setIsPaused(false)}
        >
            <div className="w-full h-auto flex items-center justify-between mb-4">
                <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-white mt-[5px]">
                    Mocktests:
                </p>
                <input 
                    className="p-[5px] border-2 border-gray-300 w-[30vw] min-h-[2vw] rounded-2xl text-base text-gray-600 outline-none"
                    value={MTName}
                    onChange={(e) => setMTName(e.target.value)}
                    placeholder="Search..."
                />
            </div>
    
            <div className={`grid gap-4 grid-cols-[repeat(auto-fit,minmax(400px,1fr))] transition-opacity duration-500 ease-in-out md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] ${isFading ? "opacity-0" : ""}`}>
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
                    <p className="text-[clamp(1rem,2vw,2rem)] text-white">No mock tests found.</p>
                )}
            </div>
    
            <div className="mt-auto pt-[1vw] pb-[1vw] static flex justify-around items-center w-full">
                <button 
                    onClick={back}
                    className="max-w-[70px] max-h-[70px] w-[10vw] h-[10vw] rounded-full bg-primary border-none font-semibold flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(180,160,255,0.253)] cursor-pointer transition-all duration-300 overflow-hidden relative"
                >
                    <svg className="w-3 transition-all duration-300" viewBox="0 0 384 512">
                        <path className="fill-white"
                            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                        />
                    </svg>
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

export default PastMocktestList;
