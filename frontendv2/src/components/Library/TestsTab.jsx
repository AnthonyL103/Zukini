import React, { useState, useEffect } from 'react';
import { useUser } from '../authentication/UserContext';
import { useMT } from '../mocktests/MTcontext';
import { useScan } from '../scans/ScanContext';
import { useNavigate } from 'react-router-dom';

const TestsTab = () => {
  const navigate = useNavigate();
  const { setCurrentMT, currentMT } = useMT();
  const { setCurrentScan } = useScan();
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [testToDelete, setTestToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { userId } = useUser();

  // Fetch tests on component mount or when userId changes
  useEffect(() => {
    const fetchTests = async () => {
        try {
          const response = await fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch tests');
          const data = await response.json();
          setTests(data); // Ensure UI updates correctly
        } catch (error) {
          console.error('Error fetching tests:', error);
        }
      };
    fetchTests();
  }, [userId], currentMT);

  // Function to fetch tests from API
  
  
  const handleStudy = (test) => {
    setCurrentMT(test);
    getScan(test.scankey);
    console.log("test", test);
    navigate('/study', { 
      state: { initialMode: 'test' } 
    });
  };
  
  const getScan = async (scankey) => {
    if (!scankey) {
      console.error("scankey is missing");
      setCurrentScan(null);
      return;
    }

    try {
      const response = await fetch(`https://api.zukini.com/scans/getscan?scankey=${scankey}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to fetch scan");

      const data = await response.json();
      

      if (!data.scan) {
        console.error("No scan found for scankey:", scankey);
        return;
      }

      setCurrentScan(data.scan);
      console.log("found curre scan", data.scan);
      console.log("Scan retrieved successfully:", data.scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      setCurrentScan(null);
    }
  };

  // Handle delete button click
  const handleDelete = (test) => {
    setTestToDelete(test);
    setShowDeleteModal(true);
  };

  // Confirm deletion of test
  const confirmDelete = async () => {
    if (!testToDelete) {
      console.error("No test selected for deletion.");
      return;
    }

    try {
      console.log("Deleting test:", testToDelete.mocktestkey);

      const response = await fetch(
        `https://api.zukini.com/display/deleteMT?userId=${userId}&key=${testToDelete.mocktestkey}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete test');

      setTests((prevTests) =>
        prevTests.filter(test => test.mocktestkey !== testToDelete.mocktestkey)
      );

      setShowDeleteModal(false);
      setTestToDelete(null);
      setCurrentMT(null);
      // Ensure latest tests are fetched
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  // Filter tests based on search query
  const filteredTests = tests.filter(test =>
    test.mtsessionname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search mock tests..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <div key={test.mocktestkey} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">{test.mtsessionname}</h3>
            <p className="text-gray-600 text-sm mb-4">
              From: {test.scanname}<br />
              Created: {new Date(test.date).toLocaleDateString()}
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleStudy(test)}
                className="hover:cursor-pointer flex-1 px-3 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-[#2c2099] transition-all text-sm font-semibold"
              >
                Take Test
              </button>
              <button 
                onClick={() => handleDelete(test)}
                className="hover:cursor-pointer flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && testToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Delete Mock Test
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{testToDelete.mtsessionname}"? This action cannot be undone.
            </p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTestToDelete(null);
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

export default TestsTab;
