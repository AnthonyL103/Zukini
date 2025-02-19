// In FilesPage.jsx
import { useState, useEffect, useRef } from 'react';
import ScanList from '../scans/ScanList';
import { useUser } from '../authentication/UserContext';
import AddScan from '../scans/AddScan';

const FilesPage = () => {
  const [scans, setScans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);
  const { userId, setTotalScans } = useUser();
  const slidesRef = useRef([null, null]);


  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch(`http://18.236.227.203:5001/displayscans?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScans(data);
      } catch (error) {
        console.error('Error fetching scans:', error);
        setScans([]); // Set empty array as fallback
      }
    };
  
    if (userId) {
      fetchScans();
    }
  }, [userId]);
  
  const scrollToNextSlide = () => {
    if (slidesRef.current[1]) {
      slidesRef.current[1].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const scrollToTop = () => {
    if (slidesRef.current[0]) {
      slidesRef.current[0].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const displayModal = (key) => {
    setScanToDelete(key);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScanToDelete(null);
  };

  useEffect(() => {
    setTotalScans(scans.length);
  }, [scans, setTotalScans]);

  const handleAddScan = (newScan) => {
    setScans((prevScans) => [...prevScans, newScan]);
  };

  const handleDeleteScan = async () => {
    try {
      const endpoint = `http://18.236.227.203:5001/deleteScan?userId=${userId}&key=${scanToDelete}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${scanToDelete}`);
      }

      setScans((prevScans) => prevScans.filter((scan) => scan.scankey !== scanToDelete));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  return (
    <div className="max-w-[1200px] h-[80dvh] md:h-[75dvh] p-6 mt-[1vh] mx-auto overflow-y-auto snap-y snap-mandatory">
      <div ref={(el) => slidesRef.current[0] = el} className="mb-4">
        <ScanList
          scans={scans}
          onDelete={displayModal}
          scroll={() => {
            if (slidesRef.current[1]) {
              slidesRef.current[1].scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
              });
            }
          }}
        />
      </div>

      <div ref={(el) => slidesRef.current[1] = el}>
        <AddScan
          onAddScan={handleAddScan}
          scrollToTop={() => {
            if (slidesRef.current[0]) {
              slidesRef.current[0].scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
              });
            }
          }}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
          <div className="bg-white w-1/2 max-w-full rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-black font-extrabold text-xl">Are you Sure?</h2>
            <div className="flex justify-between items-center gap-5 mt-5">
              <button
                className="w-[48%] h-[7dvh] flex items-center justify-center bg-black text-white text-sm font-bold uppercase tracking-wide rounded-lg transition-transform duration-300 hover:bg-purple-300 hover:text-black active:translate-y-2"
                onClick={handleCloseModal}
              >
                No
              </button>
              <button
                className="w-[48%] h-[7dvh] flex items-center justify-center bg-red-600 text-white text-sm font-bold uppercase tracking-wide rounded-lg transition-transform duration-300 hover:bg-purple-300 hover:text-black active:translate-y-2"
                onClick={handleDeleteScan}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;