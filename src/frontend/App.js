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
        console.log('Fetched scans:', data);
        setScans(data);
      } catch (error) {
        console.error('Error fetching scans:', error);
      }
    };

    fetchScans();
  }, []);

  const handleDeleteScan = async (filepath) => {
    console.log(filepath)
    try {
      const response = await fetch('http://localhost:5001/deleteScan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filepath: filepath }),
      });
      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to delete scan');
      }

      // Update the state to remove the deleted scan
      setScans((prevScans) => prevScans.filter((scan) => scan.filepath !== filepath));
      console.log('Scan deleted successfully:', filepath);
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  return (
    <div className="container">
      <h1>Scans</h1>
      <ScanList scans={scans} onDelete={handleDeleteScan}/>
    </div>
  );
};

export default App;
