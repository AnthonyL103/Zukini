import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../authentication/UserContext';
import { useScan } from '../scans/ScanContext';
import { useFC } from '../flashcards/FCcontext';
import { useMT } from '../mocktests/MTcontext';


import AddScan from "../scans/AddScan";

const Create = () => {
  const navigate = useNavigate();
  const { setCurrentScan } = useScan();
  const { setCurrentFC } = useFC();
  const { setCurrentMT } = useMT();
  const { userId, setTotalScans } = useUser();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const slidesRef = useRef([]);

    useEffect(() => {
      const fetchScans = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `https://api.zukini.com/display/displayscans?userId=${userId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch scans");
          }
          const data = await response.json();
          setScans(data);
          setTotalScans(data.length);
        } catch (err) {
          console.error("Error fetching scans:", err);
          setError("Error loading scans. Please try again.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchScans();
    }, [userId, setTotalScans]);
  
    const showToast = (message, type = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };
  
  
    const handleCloseModal = () => {
      setShowModal(false);
      setScanToDelete(null);
    };
  
    const handleAddScan = (newScan) => {
      setScans((prev) => {
        const updated = [...prev, newScan];
        setTotalScans(updated.length);
        return updated;
      });
      showToast("Scan added successfully!");
      setCurrentScan(newScan);
      setCurrentFC(null);
      setCurrentMT(null);

      navigate('/study', { 
        state: { 
          initialMode: 'review'
        } 
      });
    };
  
    const handleDeleteScan = async () => {
      try {
        const endpoint = `https://api.zukini.com/display/deleteScan?userId=${userId}&key=${scanToDelete}`;
        const response = await fetch(endpoint, { method: "DELETE" });
        if (!response.ok) {
          throw new Error(`Failed to delete scan ${scanToDelete}`);
        }
        setScans((prev) => {
          const updated = prev.filter((scan) => scan.scankey !== scanToDelete);
          setTotalScans(updated.length);
          return updated;
        });
        showToast("Scan deleted successfully!", "success");
      } catch (err) {
        console.error("Error deleting scan:", err);
        showToast("Failed to delete scan.", "error");
      } finally {
        handleCloseModal();
      }
    };
  
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
  

  // Redirect if not logged in\
  /*
  useEffect(() => {
    if (!userId || userId.startsWith('guest')) {
      navigate('/login');
    }
  }, [userId, navigate]);

  
  */

  return (
    <motion.div className="min-h-screen bg-gray-50 py-10">
      <div className="container m-auto px-4">
        <div className="mt-5">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-[#0f0647]">
              Create New Content
            </h1>
            <p className="text-lg text-gray-600 mt-3">
              Choose what type of content you want to create
            </p>
          </div>
        {/* Main content container - applies to both sections */}
        <div className="max-w-5xl m-auto pt-10">
          <div className="relative z-10 px-0">
            {error && (
              <div className="mb-4 text-center text-red-500">{error}</div>
            )}
            
            {/* Add Scan Card */}
            <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg w-full">
              <div className="bg-white rounded-xl p-6">
                <AddScan
                  onAddScan={handleAddScan}
                  scrollToTop={scrollToTop}
                  slidesRef={slidesRef}
                />
              </div>
            </div>
          </div>

          {/* Creation Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-10">
            {/* Flashcard Creation Option */}
            <button
              onClick={() => navigate('/library', { state: { autoOpenFlashcards: true } })}
              className="w-full text-left"
            >
              <div className="flex rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg transition hover:shadow-2xl">
                <div className="bg-white rounded-xl p-6 w-full">
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">
                    Past Flashcards
                  </h3>
                  <p className="text-gray-600 mb-4">
                    View existing flashcards or create new ones from uploaded scans.
                  </p>
                  <div className="text-sm text-primary"> Go now →</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/library', { state: { autoOpenMocktests: true } })}
              className="w-full text-left"
            >
              <div className="h-full rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg transition hover:shadow-2xl">
                <div className="h-full bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">
                    Past Mock Test
                  </h3>
                  <p className="text-gray-600 mb-4">
                    View existing mocktests or create new ones from uploaded scans.
                  </p>
                  <div className="text-sm text-primary">Go now →</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div
              role="dialog"
              aria-modal="true"
              className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Confirm Deletion
              </h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete this scan?
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
                  onClick={handleDeleteScan}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
    </motion.div>
  );
};

export default Create;