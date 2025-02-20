import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../authentication/UserContext";

const AddScan = ({ onAddScan, scrollToTop, slidesRef }) => {
  const [showModal, setShowModal] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [currFile, setCurrFile] = useState("");
  const [file, setFile] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [currDate, setCurrDate] = useState("");
  const [scanName, setScanName] = useState("");
  const { userId } = useUser();

  const handleFileChange = async (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) return;
    setErrorMessage("");
    await handleSubmit(selectedFile);
    fileInputRef.current.value = "";
  };

  const handleScanNameChange = (e) => {
    setScanName(e.target.value);
    if (scanName.length !== 0) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (selectedFile) => {
    if (!scanName) {
      setErrorMessage("Please enter a scan name");
      return;
    }
    setisLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const parseResponse = await fetch(
        "https://api.zukini.com/scans/callparse",
        {
          method: "POST",
          body: formData,
        }
      );
      const parseResult = await parseResponse.json();
      setCurrDate(parseResult.date);
      setCurrFile(parseResult.filePath);
      setParsedText(parseResult.text);
      setShowModal(true);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleCloseModal = () => {
    setDisplayedText("");
    setisLoading(false);
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
      const parseResponse = await fetch(
        "https://api.zukini.com/scans/callparse",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!parseResponse.ok) {
        throw new Error("Failed to re-scan the file");
      }
      const parseResult = await parseResponse.json();
      setDisplayedText("");
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
        setDisplayedText("");
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
  
  useEffect(() => {
          if (showModal && parsedText.trim() !== "") {
              console.log(showModal, parsedText);
              const words = parsedText.split(" ");
              let currentIndex = -1; // Start at -1 to include the first word
      
              const interval = setInterval(() => {
                  currentIndex++; // Move index before using it
      
                  if (currentIndex < words.length) {
                      setDisplayedText((prev) =>
                          prev ? `${prev} ${words[currentIndex]}` : words[currentIndex]
                      );
                  } else {
                      clearInterval(interval); // Stop when all words are displayed
                  }
              }, 50);
        }
    }, [showModal, parsedText]);
    

  return (
    <>
      <div ref={(el) => (slidesRef.current[1] = el)} className="p-6">
        <p className="text-xl font-bold text-gray-800">Create New Scan:</p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-4">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-400"
            value={scanName}
            onChange={handleScanNameChange}
            placeholder="Enter scan name ex: Chemistry 101 Notes"
          />

          <input
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition"
            onClick={() => fileInputRef.current.click()}
          >
            Upload and Scan
            {isLoading && (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" stroke="white" strokeWidth="4" fill="none" />
              </svg>
            )}
          </button>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>

        <div className="mt-4 flex justify-center">
          <button
            className="p-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            onClick={scrollToTop}
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Parsed Text Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <p className="text-lg font-semibold text-gray-900 text-center">Parsed Text:</p>
            <div className="p-4 bg-gray-100 rounded-lg h-48 overflow-y-auto mt-4">
              <p className="text-black-700">{displayedText}</p>
            </div>
            <div className="flex justify-between mt-6">
              <button
                className="w-1/2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition"
                onClick={handleCloseModal}
              >
                Accept
              </button>
              <button
                className="w-1/2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
                onClick={handleReScan}
              >
                Re-Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddScan;
