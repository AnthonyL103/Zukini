import { MdDeleteForever } from 'react-icons/md';

const Scan = ({ scanname, text, date }) => {
  return (
    <div className="scan">
      <span><strong>Scan name:</strong> {scanname}</span>
      <br />
      <span>{text}</span>
      <div className="scan-footer">
        <small>{date}</small>
        <MdDeleteForever className="delete-icon" size="1.3em" />
      </div>
    </div>
  );
};

export default Scan;
      
