import React, { useState, useRef } from 'react';
import { useScan } from '../scans/ScanContext';
import { useUser } from '../authentication/UserContext';
import PencilLoader from '../utils/pencilloader';

export const ReviewMode = () => {
  const { currentScan } = useScan();
  const [notes, setNotes] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const { userId} = useUser();
  
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const summaryRef = useRef(null);

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
  
  const handleSummarize = async () => {
    if (!currentScan || !currentScan.value) {
      alert("No scan selected or no text available to summarize.");
      return;
    }

    setLoading(true);
    
    const SummaryStorageKey = `summary_${userId}_${currentScan.scankey}`;

    // Check if a summary already exists in localStorage
    const storedSummary = localStorage.getItem(SummaryStorageKey);
    if (storedSummary) {
        console.log("Loading Summary from local storage for user:", userId);
        setSummary(JSON.parse(storedSummary));
        setLoading(false);
        setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth" }), 100); // Scroll to summary
        return;
    }

    try {
      const response = await fetch('https://api.zukini.com/scans/callsummarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentScan.value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to summarize. Server returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.summary) {
        setSummary(data.summary);
        localStorage.setItem(SummaryStorageKey, JSON.stringify(data.summary));
        console.log("Generated summary stored:", data.summary);
        setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth" }), 100); // Auto scroll
      } else {
        console.warn("⚠️ Received an empty summary from the API.");
      }

    } catch (error) {
      alert("Failed to generate summary. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4"> Scan Name: {currentScan?.scanname || "None"}</h2>
      
      {/* Original Scan View */}
      {!currentScan ? (
        <div className="bg-red-100 p-4 rounded-lg mb-6 mt-6 text-red-700 text-center">
          No scan available. Please select or upload a scan.
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold mb-2">Text:</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{currentScan.value}</p>
        </div>
      )}
      
      {currentScan && (
        <div className="flex justify-between gap-4 mb-6">
            <button
            onClick={handleSummarize}
            className={`flex-1 py-2 rounded-lg text-white transition-opacity ${
                loading
                ? "bg-gray-400 cursor-not-allowed opacity-50" // Disabled when loading
                : "bg-[#0f0647] hover:bg-opacity-90 hover:bg-[#2c2099]" // Normal state
            }`}
            disabled={loading}
            >
            Summarize
            </button>
        </div>
        )}

      
      <h2 ref={summaryRef} className="text-2xl font-bold text-[#0f0647] mb-4">Summary:</h2>
      
      {summary?.length > 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-[500px] overflow-y-auto">
        <p className="text-gray-600 whitespace-pre-wrap">{summary}</p>
        </div>
        
      ) : loading ? (
         <PencilLoader/>
       
      ) : (
        <div className="bg-red-100 p-4 rounded-lg text-red-700 text-center">
        No summary available, click summary button to generate one.
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