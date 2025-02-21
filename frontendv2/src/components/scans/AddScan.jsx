import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../authentication/UserContext";

const AddScan = ({ onAddScan, scrollToTop, slidesRef }) => {
  const [showModal, setShowModal] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [currFile, setCurrFile] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currDate, setCurrDate] = useState("");
  const [scanName, setScanName] = useState("");
  const { userId } = useUser();

  const handleScanNameChange = (e) => {
    setScanName(e.target.value);
    if (scanName.length !== 0) {
      setErrorMessage("");
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFile(file);
    setErrorMessage("");
  }, []);

  const handleUpload = async () => {
    if (!scanName.trim()) {
      setErrorMessage("Please enter a scan name");
      return;
    }
    if (!file) {
      setErrorMessage("Please select a file");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const parseResponse = await fetch("https://api.zukini.com/scans/callparse", {
        method: "POST", 
        body: formData,
      });
      const parseResult = await parseResponse.json();
      setCurrDate(parseResult.date);
      setCurrFile(parseResult.filePath);
      setParsedText(parseResult.text);
      setShowModal(true);
    } catch (error) {
      console.error("Error in handleUpload:", error);
      setErrorMessage("Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });
  
  const handleCloseModal = () => {
    setIsLoading(false);
    setShowModal(false);
    onsave();
  };

  const handleReScan = async () => {
    setShowModal(false);
    if (!file) {
      console.error("No file available for re-scan");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const parseResponse = await fetch("https://api.zukini.com/scans/callparse", {
        method: "POST",
        body: formData,
      });
      if (!parseResponse.ok) {
        throw new Error("Failed to re-scan the file");
      }
      const parseResult = await parseResponse.json();
      setParsedText(parseResult.text);
      setShowModal(true);
    } catch (error) {
      console.error("Error during re-scan:", error);
    }
  };

  const onsave = async () => {
    try {
      if (parsedText.length === 0) {
        setErrorMessage("Please upload a file");
        return;
      }
      const key = uuidv4();
      const payload = {
        scankey: key,
        filePath: currFile,
        scanName,
        parsedText,
        currDate,
        userId: userId,
      };

      const onsaveresponse = await fetch(
        "https://api.zukini.com/scans/saveandexit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (onsaveresponse.ok) {
        if (onAddScan) {
          onAddScan({
            scankey: key,
            filepath: currFile,
            scanname: scanName,
            value: parsedText,
            date: currDate,
            userId: userId,
          });
        }
        setShowModal(false);
        setParsedText("");
        setCurrFile("");
        setScanName("");
        setFile(null);
        scrollToTop();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error during saving:", error);
    }
  };


  return (
    <div ref={(el) => (slidesRef.current[1] = el)} className="p-6">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
        Create New Scan
      </h2>

      <div className="space-y-5">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={scanName}
          onChange={handleScanNameChange}
          placeholder="Enter scan name, e.g., Chemistry 101 Notes"
        />

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all 
            ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"} ${
            isLoading ? "pointer-events-none" : "hover:border-indigo-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            {file ? (
              <p className="text-gray-800 font-medium">
                Selected file: {file.name}
              </p>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V28m-4-4v-4m0 0v-8a4 4 0 00-4-4h-8m0 0V4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-gray-600">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF and images
                </p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !scanName.trim() || isLoading}
          className={`w-full p-3 rounded-lg font-semibold transition-all hover:cursor-pointer 
            ${
              !file || !scanName.trim() || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0f0647] to-[#67d7cc] text-white hover:opacity-90"
            }`}
        >
          {isLoading ? "Processing..." : "Upload Scan"}
        </button>

        {errorMessage && (
          <p className="text-red-500 text-center text-sm">{errorMessage}</p>
        )}
      </div>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 overrflow:hidden backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full m-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Parsed Text Preview
            </h3>
            <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {parsedText}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                className="hover:cursor-pointer flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-all"
                onClick={handleCloseModal}
              >
                Accept
              </button>
              <button
                className="hover:cursor-pointer flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                onClick={handleReScan}
              >
                Re-Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddScan;
