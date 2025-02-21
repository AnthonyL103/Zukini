import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from './ScanContext';

const Scan = ({ scankey, filepath, scanname, text, date, onDelete }) => {
  const navigate = useNavigate();
  const { setCurrentScan } = useScan();
  const [showStudyModal, setShowStudyModal] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(scankey);
      console.log("frontend", scankey);
      console.log("frontend", filepath);
    }
  };

  const handleStudyOption = (type) => {
    setCurrentScan({ filepath, scanname, text, date });
    setShowStudyModal(false);
    navigate('/study', { state: { initialMode: type } });
  };

  return (
    <>
      <div className="bg-surface rounded-2xl p-4 text-lg h-[60dvh] flex flex-col overflow-auto relative touch-manipulation">
        <span className="font-bold">Scan name: {scanname}</span>
        <span className="font-bold">Date: <small>{date}</small></span>
        <br />
        <span>{text}</span>
        
        <div className="mt-auto flex justify-between sticky bottom-0">
          <button 
            onClick={() => setShowStudyModal(true)}
            className="w-[48%] hover:cursor-pointer border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
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

      {/* Study Options Modal */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300
        ${showStudyModal ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none"}`}>
        {showStudyModal && (
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-6 text-center">
              Choose Study Mode
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleStudyOption('flashcards')}
                className="w-full p-4 text-left bg-white rounded-xl border-2 border-[#0f0647] hover:bg-[#0f0647] hover:text-white transition-colors group"
              >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Flashcards</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                  Generate interactive flashcards from your notes
                </p>
              </button>

              <button
                onClick={() => handleStudyOption('test')}
                className="w-full p-4 text-left bg-white rounded-xl border-2 border-[#67d7cc] hover:bg-[#67d7cc] hover:text-white transition-colors group"
              >
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white">Mock Test</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-200">
                  Create a practice test from your study material
                </p>
              </button>
            </div>

            <button
              onClick={() => setShowStudyModal(false)}
              className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Scan;