//md delete forever is just a visual icon
import { useNavigate } from 'react-router-dom';
import { useScan } from './ScanContext';

const Scan = ({ filepath, scanname, text, date, onDelete }) => {
  const navigate = useNavigate();
  const { setCurrentScan } = useScan();
  const handleDelete = () => {
    if (onDelete) {
      onDelete(filepath); // Notify the parent to delete the scan
    }
  };
  const handleStudy = () => {
    // Set the current scan in context
    setCurrentScan({ scanname, text, date });
    // Navigate to the study page
    navigate('/study');
  };
  return (
    <div className="scan">
      <span><strong>Scan name:</strong> {scanname}</span>
      <br />
      <span>{text}</span>
      <div className="scan-footer">
        <small>{date}</small>
        <div class="action-btn">
        <button className="study-button" onClick={handleStudy}>
          Study
        </button>
        <button className = "del-button" onClick={handleDelete}>
          Delete
        </button>
        </div>
      </div>
    </div>
  );
};

export default Scan;
      
