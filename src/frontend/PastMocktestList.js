import { useState, useEffect } from "react";
import MTentry from "./MTentry";
import { useUser } from './UserContext';


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
        <div ref={(el) => {
            if (!slidesRef.current) slidesRef.current = [];
            slidesRef.current[2] = el; // Assign the third slide
        }} className="studypagecont"
            onMouseEnter={() => setIsPaused(true)}  
            onMouseLeave={() => MTName.trim() === "" && setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}  // Pause scrolling on touch (Mobile)
            onTouchEnd={() => MTName.trim() === "" && setIsPaused(false)} // Resume scrolling on release (Mobile)
            >
            <div className="scanheaderwrapper">
                <p className="scans-title">Mocktests:</p>
                <input 
                    className="scansnameinput"
                    value={MTName}
                    onChange={(e) => setMTName(e.target.value)}
                    placeholder="Search..."
                />
            </div>

            <div className={`MTentries-list ${isFading ? "fade" : ""}`}>
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
                            pausescroll= {setIsStudyModalOpen}
                        />
                    ))
                ) : (
                    <p className="nosearch">No mock tests found.</p>
                )}
            </div>
            <div className="addscanwrap">
            <button className="gobackbutton" onClick={back}>
                <svg className="svgIcon" viewBox="0 0 384 512">
                    <path
                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                    ></path>
                </svg>
                </button>
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

export default PastMocktestList;
