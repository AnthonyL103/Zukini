import React, { useState, useEffect } from 'react';
import { useUser } from '../authentication/UserContext';

const ScansTab = () => {
  const [scans, setScans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { userId } = useUser();

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

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search scans..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScans.map((scan) => (
          <div key={scan.scankey} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">{scan.scanname}</h3>
            <p className="text-gray-600 text-sm mb-4">{new Date(scan.date).toLocaleDateString()}</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark">
                Study
              </button>
              <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScansTab;