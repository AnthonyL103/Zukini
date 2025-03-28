import { useState, useEffect, useRef } from 'react';
import ScanList from '../scans/ScanList.js';
import { useUser } from '../authentication/UserContext';
import AddScan from '../scans/AddScan';


const FilesPage = () => {
  const [scans, setScans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null); 
  const { userId, setTotalScans } = useUser();
  const slidesRef = useRef([]);
  
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch(`https://api.zukini.com/display/displayscans?userId=${userId}`);;
        if (!response.ok) {
          throw new Error('Failed to fetch scans');
        }
        const data = await response.json();
        console.log('Fetched scans:', data);
        setScans(data);
      } catch (error) {
        console.error('Error fetching scans:', error);
      }
    };

    fetchScans();
  }, [userId]);
  
  const displayModal = (key) => {
    setScanToDelete(key); // Set the scan to delete
    //console.log(" reckey",key);
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setScanToDelete(null); // Clear the scan to delete
  };
  
  
  
  const scrollToNextSlide = () => {
    slidesRef.current[1].scrollIntoView({
        behavior: "smooth",
        block: "start", // Ensures it aligns properly with snap
        inline: "nearest",
    });
    
  };
  const scrollToTop = () => {
    slidesRef.current[0].scrollIntoView({
        behavior: "smooth",
        block: "start", // Ensures it aligns properly with snap
        inline: "nearest",
    });
  };
  
  useEffect(() => {
    setTotalScans(scans.length);
  }, [scans, setTotalScans]);
  
  const handleAddScan = (newScan) => {
    setScans((prevScans) => [...prevScans, newScan]);
  };

  const handleDeleteScan = async () => {
    try {
        let endpoint = `https://api.zukini.com/display/deleteScan?userId=${userId}&key=${scanToDelete}`;
    
            const response = await fetch(endpoint, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete ${scanToDelete}`);
            }
      

      // Update the state to remove the deleted scan
      setScans((prevScans) => prevScans.filter((scan) => scan.scankey !== scanToDelete));

      console.log('Scan deleted successfully:', scanToDelete);
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };
  
  
  



  return (
    <div className="filescontainer">
      <ScanList scans={scans} onDelete={displayModal} scroll={scrollToNextSlide} slidesRef={slidesRef}/>
      
      <AddScan onAddScan={handleAddScan} scrollToTop={scrollToTop} slidesRef={slidesRef}/>
      <div className={`deleteWarn-container ${showModal ? "show" : ""}`}>
        {showModal && (
        <div className="deleteWarn-modal">
        <h2 className="deleteWarn-heading">Are you Sure?</h2>
        <div className="deleteWarnbutton-wrapper">
            
            <button
            className="deleteWarn-buttoncancel" // Updated to match CSS
            onClick={handleCloseModal}
            >
            No
            </button>
            <button
            className="deleteWarn-button" // Updated to match CSS
            onClick={handleDeleteScan}
            >
            Yes
            </button>
        </div>
        </div>
        )}
    </div>
</div>
  );
};

export default FilesPage;
