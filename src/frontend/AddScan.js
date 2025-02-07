import {useState, useEffect, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from './UserContext';


const AddScan = ({onAddScan})  => {
    const [lastFile, setLastFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [parsedText, setParsedText] = useState("");
    const [currFile, setCurrFile] = useState("");
    const [file, setFile] = useState(null);
    const [displayedText, setDisplayedText] = useState("");
    const fileInputRef = useRef(null);
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [currDate, setCurrDate] = useState("");
    const [scanName, setScanName] = useState("");
    const { userId } = useUser();
    const handleClick = () => {
        fileInputRef.current.click();
    };
        
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile);
            setLastFile(selectedFile); // Store a copy for re-scanning
        }
    };
    const handleScanNameChange = (e) => {
      setScanName(e.target.value); // Update scan name state
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (!file) {
        console.error('No file selected for upload');
        return;
      }
    
      const formData = new FormData();
      formData.append('file', file);
    
      try {
        // Step 1: Upload the file
        const parseResponse = await fetch('http://18.236.227.203:5002/callparse', {
            method: 'POST',
            body: formData, // Send file directly
        });
        const parseResult = await parseResponse.json();
        // Get the file path from the upload response
        setCurrDate(parseResult.date);
        setCurrFile(parseResult.filePath);
        setParsedText(parseResult.text); // Update the parsed text
        setShowModal(true); // Show modal with parsed text
    
        console.log('File parsed successfully:');
      } catch (error) {
        console.error('Error in handleSubmit:', error);
      }
    };
    
    
    const handleCloseModal = () => {
        setDisplayedText("");
        setShowModal(false); // Close the modal
        setSaveEnabled(true);
    };

    const handleReScan = async () => {
      setShowModal(false);
      console.log("in rescan");
      const fileToRescan = file || lastFile;
      
      if (!fileToRescan) {
        console.error("No file available for re-scan");
        return;
      }
      const formData = new FormData();
      formData.append('file', fileToRescan); 
      try {
        const parseResponse = await fetch('http://18.236.227.203:5002/callparse', {
          method: 'POST',
          body: formData, // Send filePath as JSON
        });
    
        if (!parseResponse.ok) {
          throw new Error('Failed to re-scan the file');
        }
    
        const parseResult = await parseResponse.json();
        setDisplayedText(""); // Clear displayed text for re-animation
        // Clear previous displayed text
        setParsedText(parseResult.text); // Update the parsed text
        console.log(parseResult.text);
        setShowModal(true);
      } catch (error) {
        console.error('Error during re-scan:', error);
      }
    };

    
    const onsave = async () => {
      try {
        // Prepare the data as JSON
        const key = uuidv4();
        console.log("currkey", key);
        const payload = {
          scankey: key,
          filePath: currFile, // Send the current file path
          scanName,
          parsedText, // Send the parsed text
          currDate,
          userId: userId,
          
        };
    
        // Sending the POST request with JSON
        const onsaveresponse = await fetch('http://18.236.227.203:5002/saveandexit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Specify JSON content type
          },
          body: JSON.stringify(payload), // Convert the payload to JSON
        });
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
    
          // Clear form data and states
          setShowModal(false);

            
          setParsedText(""); // Reset parsed text **after** modal is closed
          setCurrFile("");
          setScanName("");
          setFile(null);
          setDisplayedText("");
          setSaveEnabled(false);

               

              
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input field visually
          }
        } else {
          console.error('Failed to save data');
        }
        console.log("made it");
        
      } catch (error) {
        console.error('Error during saving:', error);
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
    <div className = "scanwrapper" >
      <div className="scan new">
      <label htmlFor="scanName" className="Make-bold">Create a new scan:</label>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="Uploadscancontainer">
        <input
        type="text"
        className="scanname"
        id="scanName"
        value={scanName}
        onChange={handleScanNameChange}
        placeholder="Enter scan name"
        required
        />
        <input
          className="hiddenfileinput"
          type="file"
          accept="image/*,application/pdf" 
          onChange={handleFileChange}
          ref={fileInputRef}
          required
        ></input>
        
        <button type="button" className="fileinput" onClick={handleClick}>
        Upload File
        </button>
      
        <button className ="fileinput"type="submit">Upload and Scan</button>
        
        <button className="fileinput" type="button" onClick={onsave} disabled={!saveEnabled} >Save</button>
        </div>
       </form>
      </div>
      </div>
  
      
    <div className={`parsedTextmodal-container ${showModal ? "show" : ""}`}>
    {showModal && (
    <div className="parsedText-modal">
      <h2 className="parsedText-heading">Parsed Text</h2>
      <p className="parsedText-para">{displayedText}</p>
      <div className="fcmodal-content-footer">
        <button
          className="parsedText-buttonaccept"
          onClick={handleCloseModal}
        >
          Accept
        </button>
        <button
          className="parsedText-buttonRe-Scan"
          onClick={handleReScan}
        >
          Re-Scan
        </button>
      </div>
    </div>
  )}
</div>

    </>
  );
  
};
  

export default AddScan;