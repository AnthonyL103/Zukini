import { useState, useEffect, useRef } from "react";
import ScanList from "../scans/ScanList";
import { useUser } from "../authentication/UserContext";
import AddScan from "../scans/AddScan";

const FilesPage = () => {
  const [scans, setScans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);
  const { userId, setTotalScans } = useUser();
  const slidesRef = useRef([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch(
          `https://api.zukini.com/display/displayscans?userId=${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch scans");
        }
        const data = await response.json();
        setScans(data);
      } catch (error) {
        console.error("Error fetching scans:", error);
      }
    };

    fetchScans();
  }, [userId]);

  const displayModal = (key) => {
    setScanToDelete(key);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScanToDelete(null);
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
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${scanToDelete}`);
      }

      setScans((prevScans) =>
        prevScans.filter((scan) => scan.scankey !== scanToDelete)
      );

      console.log("Scan deleted successfully:", scanToDelete);
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting scan:", error);
    }
  };

  return (
    <div className="max-w-6xl h-[80dvh] p-6 mt-4 mx-auto overflow-y-auto scroll-snap-y-mandatory">
      <ScanList
        scans={scans}
        onDelete={displayModal}
        scroll={scrollToNextSlide}
        slidesRef={slidesRef}
      />

      <AddScan
        onAddScan={handleAddScan}
        scrollToTop={scrollToTop}
        slidesRef={slidesRef}
      />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900">
              Are you sure?
            </h2>
            <div className="mt-4 flex justify-between gap-4">
              <button
                className="w-1/2 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={handleCloseModal}
              >
                No
              </button>
              <button
                className="w-1/2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
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
