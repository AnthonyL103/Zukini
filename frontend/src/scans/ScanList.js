import React, { useEffect, useState } from 'react';
import Scan from './Scan';

const ScanList = ({ scans, onDelete, scroll, slidesRef}) => {
    const [startIndex, setStartIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(window.innerWidth < 768 ? 1 : 2); 
    const [scanName, setScanName] = useState("");
    const [VAscanName, setVAScanName] = useState("");
    const [viewAll, setShowViewAll] = useState(false);

    const scrollDelay = 7000; // Adjust this value to change delay time
    
     // Handle window resize to adjust `itemsPerView` uses event listenrr to detect screen change
     useEffect(() => {
        const handleResize = () => {
            setItemsPerView(window.innerWidth < 768 ? 1 : 2);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [itemsPerView]);
    
    //for searching, baased on if the input field is clear or not
    useEffect(() => {
        if (scanName.trim() !== "") {
            setIsPaused(true); // Stop auto-scrolling while searching
        } else {
            setIsPaused(false); // Resume scrolling when input is cleared
        }
    }, [scanName]);
    
    useEffect(() => {
        if (scans.length > 0 && startIndex >= scans.length) {
            setStartIndex(0); 
        }
    }, [scans, startIndex]);

    useEffect(() => {
        if (isPaused) return; // If paused, do not update
        if (scans.length < 3) return;

        const interval = setInterval(() => {
            setIsFading(true); // Start fade-out effect
            setTimeout(() => {
                setStartIndex((prevIndex) =>
                    prevIndex + itemsPerView >= scans.length ? 0 : prevIndex + itemsPerView
                );
                setIsFading(false); // Start fade-in effect
            }, 1000); // 1s fade transition
        }, scrollDelay);

        return () => clearInterval(interval); // Cleanup previous interval
    }, [scans, scrollDelay, isPaused, itemsPerView]); 
    
    const filteredScans = scans.filter(scan => 
        scan.scanname.toLowerCase().includes(scanName.toLowerCase())
    );
    
    const filteredVAScans = scans.filter(scan => 
        scan.scanname.toLowerCase().includes(VAscanName.toLowerCase())
    );
    
    const displayedScans = scanName.trim() 
        ? filteredScans.slice(0, itemsPerView)// Show all filtered scans when searching
        : scans.slice(startIndex, startIndex + itemsPerView);
    
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
        <div ref={(el) => slidesRef.current[0] = el} className="scanpagecontainer"
        onMouseEnter={() => setIsPaused(true)}  
        onMouseLeave={() => scanName.trim() === "" && setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}  // Pause scrolling on touch (Mobile)
        onTouchEnd={() => scanName.trim() === "" && setIsPaused(false)} // Resume scrolling on release (Mobile)
        > 
            <div className="scanheaderwrapper">
                <p className="scans-title">Scans:</p>
                <div className="searchVAWrap">
                <input className="scansnameinput" value={scanName}  onChange={(e) => setScanName(e.target.value)} placeholder="Search scans...."></input>
                <button className= "viewall-button" onClick={viewall} >View All</button>
               
            </div>
            </div>
            <div className={`scan-list ${isFading ? 'fade' : ''}`}>
                {displayedScans.length > 0 ? (
                    displayedScans.map((scan) => (
                        <Scan
                            key={scan.scankey}
                            scankey={scan.scankey}
                            filepath={scan.filepath}
                            scanname={scan.scanname}
                            text={scan.value}
                            date={scan.date}
                            onDelete={onDelete}
                        />
                    ))
                ) : (
                    <p className="nosearch">No scans found.</p> // Message if no results
                )}
            </div>
            <div className="addscanwrap">
                <button className="addscan-button" onClick={scrolltoNext}>Add A Scan</button>
                
            </div>
            
            <div className={`VA-container ${viewAll ? "show" : ""}`}>
            {viewAll && (
                <div className="VA-content">
                    <div className="scanheaderwrapper">
                    <p className="VA-title">Scans:</p>
                    <input className="scansnameinput" value={VAscanName}  onChange={(e) => setVAScanName(e.target.value)} placeholder="Search scans...."></input>
                    </div>
                    
                    <div className="scan-list">
                    {filteredVAScans.length > 0 ? (
                        filteredVAScans.map((scan) => (
                        <Scan
                            key={scan.scankey}
                            scankey={scan.scankey}
                            filepath={scan.filepath}
                            scanname={scan.scanname}
                            text={scan.value}
                            date={scan.date}
                            onDelete={onDelete}
                        />
                    ))
                    ) : (
                        <p className="VAnosearch">No scans found.</p> // Message if no results
                    )}
                    </div>
                    <div className="VA-content-footer">
                    <button className="deleteWarn-buttoncancel" onClick={closeviewall}>
                        Done
                    </button>
                    </div>
                </div>
            )}
        </div>
        </div>
        
    );
};

export default ScanList;
