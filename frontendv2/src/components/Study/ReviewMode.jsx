import React, { useState } from 'react';
import { useScan } from '../scans/ScanContext';

export const ReviewMode = () => {
  const { currentScan } = useScan();
  const [notes, setNotes] = useState("");
  const [annotations, setAnnotations] = useState([]);

  const handleAddHighlight = () => {
    // Add highlight functionality 
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;
    
    setAnnotations(prev => [...prev, {
      type: 'highlight',
      text: selection.toString(),
      range: selection.getRangeAt(0)
    }]);
  };

  const handleAddComment = () => {
    // Add comment functionality
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;
    
    const comment = prompt('Add a comment:');
    if (!comment) return;

    setAnnotations(prev => [...prev, {
      type: 'comment',
      text: selection.toString(),
      comment,
      range: selection.getRangeAt(0)
    }]);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">Review Mode</h2>
      
      {/* Original Scan View */}
      {!currentScan ? (
        <div className="bg-red-100 p-4 rounded-lg text-red-700 text-center">
          No scan available. Please select or upload a scan.
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold mb-2">{currentScan.scanname}</h3>
          <p className="text-gray-600">{currentScan.value}</p>
        </div>
      )}

      {/* Notes 
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Study Notes</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f0647] focus:border-transparent"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take notes here..."
        />
      </div>

      
      <div className="flex gap-2">
        <button 
          onClick={handleAddHighlight}
          className="px-4 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-opacity-90"
        >
          Highlight
        </button>
        <button 
          onClick={handleAddComment}
          className="px-4 py-2 bg-[#67d7cc] text-white rounded-lg hover:bg-opacity-90"
        >
          Add Comment
        </button>
      </div>
      Section */}
    </div>
  );
};

export default ReviewMode;