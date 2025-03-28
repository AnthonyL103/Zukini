//md delete forever is just a visual icon
import { useNavigate } from 'react-router-dom';
import { useScan } from './ScanContext';

const Scan = ({ scankey, filepath, scanname, text, date, onDelete }) => {
  const navigate = useNavigate();
  const { setCurrentScan } = useScan();
  const handleDelete = () => {
    if (onDelete) {
      onDelete(scankey); // Notify the parent to delete the scan
      console.log("frontend", scankey);
      console.log("frontend", filepath);
    }
  };
  const handleStudy = () => {
    // Set the current scan in context
    setCurrentScan({ filepath, scanname, text, date });
    // Navigate to the study page
    navigate('/study');
  };
  return (
    <div className="scan">
      <span><strong>Scan name:</strong> {scanname}</span>
      <span><strong>Date: <small>{date}</small></strong></span>
      <br />
      <span>{text}</span>
      
      <div className="scan-footer">
        <button className="study-button" onClick={handleStudy}>
          Study
        </button>
        <button className = "del-button" onClick={handleDelete}>
          Delete
        </button>
        </div>
      
      </div>
     
      
  );
};

export default Scan;
      
