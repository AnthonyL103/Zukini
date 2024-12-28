//md delete forever is just a visual icon
import { MdDeleteForever } from 'react-icons/md';

const Scan = ({ filepath, scanname, text, date, onDelete }) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(filepath); // Notify the parent to delete the scan
    }
  };
  return (
    <div className="scan">
      <span><strong>Scan name:</strong> {scanname}</span>
      <br />
      <span>{text}</span>
      <div className="scan-footer">
        <small>{date}</small>
        <MdDeleteForever className="delete-icon" size="1.3em" onClick={handleDelete}/>
      </div>
    </div>
  );
};

export default Scan;
      
