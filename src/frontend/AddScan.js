import {useState, useEffect, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from './UserContext';


const AddScan = ({onAddScan, scrollToTop, slidesRef})  => {
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
        
    const handleFileChange = async (e) => {
        e.preventDefault();
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (!selectedFile) return;
        await handleSubmit(selectedFile);
        fileInputRef.current.value = "";

    };
    
      
    const handleScanNameChange = (e) => {
      setScanName(e.target.value); // Update scan name state
    };
    const handleSubmit = async (selectedFile) => {
      if (!selectedFile) {
           console.error('No file selected for upload');
           return;
      }
    
    
      const formData = new FormData();
      formData.append('file', selectedFile);
    
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
      const fileToRescan = file 
      
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
        let userid = userId;
        if (!userId) {
            
        }
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
  
  
  const scrolltoTop = () => {
    scrollToTop();
  };
    
  return (
    <>
    <div ref={(el) => slidesRef.current[1] = el} className ="addscanpagecontainer" >
        <p className='scans-title'>Create New Scan:</p>
        <form onSubmit={(e) => e.preventDefault()} encType="multipart/form-data">
        <div className="Uploadscancontainer">
        <input
        type="text"
        className="addscannameinput"
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
        
         {/*we use file input ref to hide the ugly default file upload button, so when we do onclick it activates the file input ref which is the ref of the input form 
         then once a file is changed or that state changes we automatically try to parse */}
        <button type="button" className="fileinput" onClick={() => fileInputRef.current.click()}>
            Upload and Scan
        </button>

        
        <button className="fileinput" type="button" onClick={onsave} disabled={!saveEnabled} >Save</button>
        </div>
       </form>
       
       <div className="addscanwrap">
       <button className="gobackbutton" onClick={scrolltoTop}>
                <svg className="svgIcon" viewBox="0 0 384 512">
                    <path
                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                    ></path>
                </svg>
            </button>

        </div>
      </div>
      
  
      
    <div className={`parsedTextmodal-container ${showModal ? "show" : ""}`}>
    {showModal && (
    <div className="parsedText-modal">
      <p className="modal-title">Parsed Text:</p>
      <div className="parsedTextcontent"> 
        <p className="parsedText-para">{displayedText}</p>
      </div>
      <div className="parsedTextmodal-footer">
        <button
          className="deleteWarn-buttoncancel"
          onClick={handleCloseModal}
        >
          Accept
        </button>
        <button
          className="deleteWarn-buttoncancel"
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