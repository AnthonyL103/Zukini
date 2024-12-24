import { useState, useEffect } from 'react';
import ScanList from './ScanList';

const App = () => {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch('http://localhost:5001/displayscans');
        if (!response.ok) {
          throw new Error('Failed to fetch scans');
        }
        const data = await response.json();
        setScans(data);
      } catch (error) {
        console.error('Error fetching scans:', error);
      }
    };

    fetchScans();
  }, []);

  return (
    <div className="app">
      <h1>Scans</h1>
      <ScanList scans={scans} />
    </div>
  );
};

export default App;
