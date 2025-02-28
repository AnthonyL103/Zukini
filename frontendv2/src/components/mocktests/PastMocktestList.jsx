import React, { useState, useEffect } from "react";
import { useScan } from '../scans/ScanContext'; // Ensure correct import
import { useUser } from '../authentication/UserContext';
import { useMT } from '../mocktests/MTcontext';
import { Trash2 } from 'lucide-react';

const PastMockTestList = ({ NewMTEntry }) => {
  const { userId } = useUser();
  const { setCurrentMT } = useMT();
  const { currentScan } = useScan();
  const [mocktests, setMockTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mocktestToDelete, setMockTestToDelete] = useState(null);

  useEffect(() => {
    if (!currentScan) {
        return;
    }
    const fetchMockTests = async () => {
      try {
        if (!currentScan) {
            return;
        }
        const response = await fetch(`https://api.zukini.com/display/displayMTfromScanID?scanId=${currentScan.scankey}`);
        if (!response.ok) throw new Error('Failed to fetch mock tests');
        const data = await response.json();
        setMockTests(data);
      } catch (error) {
        console.error('Error fetching mock tests:', error);
      }
    };

    fetchMockTests();
  }, [userId]);

  useEffect(() => {
    if (NewMTEntry) {
        console.log(NewMTEntry);
        setMockTests(prevEntries => [...prevEntries, NewMTEntry]);
    }
  }, [NewMTEntry]);

  const filteredMockTests = mocktests.filter(mocktest =>
    mocktest.mtsessionname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTakeTest = (mocktest) => {
    setCurrentMT(mocktest);
  };

  const handleDelete = (mocktest) => {
    
    setMockTestToDelete(mocktest);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `https://api.zukini.com/display/deleteMT?userId=${userId}&key=${mocktestToDelete.mocktestkey}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete mock test');

      setMockTests(prevMockTests =>
        prevMockTests.filter(mt => mt.mocktestkey !== mocktestToDelete.mocktestkey)
      );
      setShowDeleteModal(false);
      setCurrentMT(null);
      setMockTestToDelete(null);
    } catch (error) {
      console.error('Error deleting mock test:', error);
    }
  };

  return (
    <div className="mt-6">
        <h2 className="text-2xl font-bold text-[#0f0647]">
          Past Tests
        </h2>
        <div className="mb-6 mt-6">
        <input
            type="text"
            placeholder={mocktests.length === 0 ? "No tests associated with this scan." : "Search mock tests..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f0647] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={mocktests.length === 0} 
            style={{
            backgroundColor: mocktests.length === 0 ? "#f0f0f0" : "white",
            cursor: mocktests.length === 0 ? "not-allowed" : "text",
            }}
        />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMockTests.map((mocktest) => (
          <div key={mocktest.mocktestkey} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all relative">
            <button 
              onClick={() => handleDelete(mocktest)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors rounded-full hover:bg-red-50"
              aria-label="Delete mock test"
            >
              <Trash2 size={20} />
            </button>
            <h3 className="font-semibold text-lg mb-2 pr-8">{mocktest.mtsessionname}</h3>
            <p className="text-gray-600 text-sm mb-4">{new Date(mocktest.date).toLocaleDateString()}</p>
            <button 
              onClick={() => handleTakeTest(mocktest)}
              className="hover:cursor-pointer hover:bg-[#2c2099] flex-1 px-3 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
            >
              Take Test
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && mocktestToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Delete Mock Test Session
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{mocktestToDelete.mtsessionname}"? This action cannot be undone.
            </p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMockTestToDelete(null);
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
    </div>
  );
};

export default PastMockTestList;
