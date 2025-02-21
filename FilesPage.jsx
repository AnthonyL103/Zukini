import { useState, useEffect, useRef } from "react";
import ScanList from "../scans/ScanList";
import { useUser } from "../authentication/UserContext";
import AddScan from "../scans/AddScan";

const FilesPage = () => {
  const { userIdUpload, setTotalScans } = useUser();
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
          `https://api.zukini.com/display/displayscans?userId=${userIdUpload}`
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
  }, [userIdUpload, setTotalScans]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const displayModal = (key) => {
    setScanToDelete(key);
    setShowModal(true);
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
  };

  const handleDeleteScan = async () => {
    try {
      const endpoint = `https://api.zukini.com/display/deleteScan?userId=${userIdUpload}&key=${scanToDelete}`;
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

  return (
    <div className="min-h-screen mt-[7dvh] bg-gradient-to-br from-gray-50 to-gray-200 relative">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg font-semibold 
          ${
            toast.type === "error"
              ? "bg-gradient-to-r from-red-400 to-red-600"
              : "bg-gradient-to-r from-green-400 to-green-600"
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-[#0f0647]">Your Files</h1>
          <p className="text-lg text-gray-600 mt-2">
            Upload and manage your study materials
          </p>
        </div>

        {error && (
          <div className="mb-4 text-center text-red-500">{error}</div>
        )}

        <div className="space-y-10">
          {/* Add Scan Card */}
          <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
            <div className="bg-white rounded-xl p-6">
              <AddScan
                onAddScan={handleAddScan}
                scrollToTop={scrollToTop}
                slidesRef={slidesRef}
              />
            </div>
          </div>

          {/* Scan List Card */}
          <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
            <div className="bg-white rounded-xl p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                </div>
              ) : (
                <ScanList
                  scans={scans}
                  onDelete={displayModal}
                  scroll={scrollToNextSlide}
                  slidesRef={slidesRef}
                />
              )}
            </div>
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
  );
};

export default FilesPage;
