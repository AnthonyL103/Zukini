//md delete forever is just a visual icon
import { useNavigate } from 'react-router-dom';


const Scan = ({ filepath, scanname, text, date, onDelete }) => {
  const navigate = useNavigate();
  const handleDelete = () => {
    if (onDelete) {
      onDelete(filepath); // Notify the parent to delete the scan
    }
  };
  const handleStudy = () => {
    // Navigate to the Study page with the scan's filepath or ID
    navigate('/study', {
      state: { scanname, text, date },
    });
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
      
