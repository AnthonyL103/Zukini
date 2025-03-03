import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../authentication/UserContext';
import { useScan } from '../scans/ScanContext';
import { useFC } from '../flashcards/FCcontext';
import { useMT } from '../mocktests/MTcontext';
import { Trash2 } from 'lucide-react'

const ScansTab = ({ autoOpenScan = null }) => {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const { userId} = useUser();
  const { setCurrentScan } = useScan();
  const { setCurrentFC } = useFC();
  const { setCurrentMT } = useMT();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch(`https://api.zukini.com/display/displayscans?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch scans');
        const data = await response.json();
        setScans(data);
      } catch (error) {
        console.error('Error fetching scans:', error);
      }
    };

    fetchScans();
  }, [userId]);

  const filteredScans = scans.filter(scan => 
    scan.scanname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudy = (scan) => {
    console.log(scan);
    setSelectedScan(scan);
    setShowStudyModal(true);
  };

  const handleStudyOption = (scan, type) => {
    setCurrentScan(scan);
    setCurrentFC(null);
    setCurrentMT(null);
    console.log("currentFC", setCurrentFC);
    navigate('/study', { state: { initialMode: type } });
  };

    // Auto-opening study modal
    useEffect(() => {
      if (autoOpenScan) {
        setSelectedScan(autoOpenScan);
        setCurrentScan(autoOpenScan);
        setCurrentFC(null);
        setCurrentMT(null);
        console.log("here");
        setShowStudyModal(true);
      }
    }, [autoOpenScan]);

  const handlePreview = (scan) => {
    setSelectedScan(scan);
    setShowPreview(true);
  };

  const handleDelete = (scan) => {
    setScanToDelete(scan);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `https://api.zukini.com/display/deleteScan?userId=${userId}&key=${scanToDelete.scankey}`,
        { method: 'DELETE' }
      );
  
      if (!response.ok) throw new Error('Failed to delete scan');
      
      // Log the response data
      const responseData = await response.json();
      console.log('Delete response:', responseData);
  
      setScans(prevScans => 
        prevScans.filter(scan => scan.scankey !== scanToDelete.scankey)
      );
      setShowDeleteModal(false);
      setScanToDelete(null);
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };
  

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search scans..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f0647] focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScans.map((scan) => (
          <div key={scan.scankey} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all relative">
            <button 
              onClick={() => handleDelete(scan)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors rounded-full hover:bg-red-50"
              aria-label="Delete scan"
            >
              <Trash2 size={20} />
            </button>
            <h3 className="font-semibold text-lg mb-2 pr-8">{scan.scanname}</h3>
            <p className="text-gray-600 text-sm mb-4">{new Date(scan.date).toLocaleDateString()}</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleStudy(scan)}
                className="hover:cursor-pointer flex-1 px-3 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-[#2c2099] transition-all text-sm font-semibold"
              >
                Study
              </button>
              <button 
                onClick={() => handlePreview(scan)}
                className="hover:cursor-pointer flex-1 px-3 py-2 bg-[#67d7cc] text-white rounded-lg hover:bg-[#5bc2b8] transition-all text-sm font-semibold"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Study Options Modal */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300
        ${showStudyModal ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none"}`}>
        {showStudyModal && selectedScan && (
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-6 text-center">
              Choose Study Mode
            </h2>
            
            <div className="space-y-4">
            <button
                onClick={() => handleStudyOption(selectedScan, 'flashcards')}
                className="hover:cursor-pointer w-full p-4 text-left bg-white rounded-xl border-2 border-[#0f0647] hover:bg-[#0f0647] hover:text-white transition-colors group"
                >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Flashcards</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                    Generate interactive flashcards from your notes
                </p>
                </button>

                <button
                onClick={() => handleStudyOption(selectedScan, 'test')}
                className="hover:cursor-pointer w-full p-4 text-left bg-white rounded-xl border-2 border-[#2968c8] hover:bg-[#2968c8] hover:text-white transition-colors group"
                >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Mock Test</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                    Create a practice test from your study material
                </p>
                </button>

                <button
                onClick={() => handleStudyOption(selectedScan, 'review')}
                className="hover:cursor-pointer w-full p-4 text-left bg-white rounded-xl border-2 border-[#67d7cc] hover:bg-[#67d7cc] hover:text-white transition-colors group"
                >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Review</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                    Review notes and generate a summary
                </p>
            </button>

            </div>

            <button
              onClick={() => setShowStudyModal(false)}
              className="hover:cursor-pointer mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && scanToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Delete Scan
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{scanToDelete.scanname}"? All flashcards and mocktests associated will be deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setScanToDelete(null);
                }}
                className="hover:cursor-pointer px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="hover:cursor-pointer px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedScan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              {selectedScan.scanname}
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-[60vh] overflow-y-auto mb-6">
              <p className="text-gray-600 whitespace-pre-wrap">{selectedScan.value}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScansTab;