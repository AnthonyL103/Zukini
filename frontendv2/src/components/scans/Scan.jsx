import { useNavigate } from 'react-router-dom';
import { useScan } from './ScanContext';

const Scan = ({ scankey, filepath, scanname, text, date, onDelete }) => {
  const navigate = useNavigate();
  const { setCurrentScan } = useScan();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(scankey);
      console.log("frontend", scankey);
      console.log("frontend", filepath);
    }
  };

  const handleStudy = () => {
    setCurrentScan({ filepath, scanname, text, date });
    navigate('/study');
  };

  return (
    <div className="bg-surface rounded-2xl p-4 text-lg h-[60dvh] flex flex-col overflow-auto relative touch-manipulation">
      <span className="font-bold">Scan name: {scanname}</span>
      <span className="font-bold">Date: <small>{date}</small></span>
      <br />
      <span>{text}</span>
      
      <div className="mt-auto flex justify-between sticky bottom-0">
        <button 
          onClick={handleStudy}
          className="w-[48%] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
        >
          Study
        </button>
        <button
          onClick={handleDelete}
          className="w-[48%] border-none flex px-6 py-3 bg-danger text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Scan;