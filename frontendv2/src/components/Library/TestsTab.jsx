import React, { useState, useEffect } from 'react';
import { useUser } from '../authentication/UserContext';

const TestsTab = () => {
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { userId } = useUser();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch tests');
        const data = await response.json();
        setTests(data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
  }, [userId]);

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
              <button className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark">
                Take Test
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

export default TestsTab;