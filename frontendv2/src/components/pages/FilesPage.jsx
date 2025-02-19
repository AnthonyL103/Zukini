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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto pt-[9dvh] px-4">
        <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg p-8 mb-8">
          <div ref={(el) => slidesRef.current[0] = el} className="mb-8">
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
        </div>
  
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
            <div className="bg-white p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
                Are you Sure?
              </h2>
              <div className="flex justify-between items-center gap-5">
                <button
                  className="px-8 py-4 bg-black text-white rounded-xl 
                           hover:bg-[#67d7cc] hover:text-black transition-all duration-300 
                           transform hover:-translate-y-1 active:translate-y-1 w-1/2"
                  onClick={handleCloseModal}
                >
                  No
                </button>
                <button
                  className="px-8 py-4 bg-red-600 text-white rounded-xl 
                           hover:bg-[#67d7cc] hover:text-black transition-all duration-300 
                           transform hover:-translate-y-1 active:translate-y-1 w-1/2"
                  onClick={handleDeleteScan}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;