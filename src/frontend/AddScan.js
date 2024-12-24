import {useState, useEffect, useRef} from 'react';

const AddScan = () => {
    const [showModal, setShowModal] = useState(false);
    const [parsedText, setParsedText] = useState("");
    const [currFile, setCurrFile] = useState("");
    const [file, setFile] = useState(null);
    const [displayedText, setDisplayedText] = useState("");
    const fileInputRef = useRef();
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [currDate, setCurrDate] = useState("");
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Update the state with the selected file
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
        const uploadResponse = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
    
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload the file');
        }
    
        const uploadResult = await uploadResponse.json();
        const filePath = uploadResult.filePath;
         // Get the file path from the upload response
        const currDate = uploadResult.uploadDate;
        setCurrFile(filePath);
        setCurrDate(currDate);
        console.log('File uploaded successfully:', filePath);
    
        // Step 2: Automatically parse the uploaded file
        const parseResponse = await fetch('http://localhost:5000/callparse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Specify JSON content type
          },
          body: JSON.stringify({ filePath }), // Properly send filePath as JSON
        });
        
    
        const parseResult = await parseResponse.json();
        setParsedText(parseResult.text); // Update the parsed text
        setShowModal(true); // Show modal with parsed text
    
        console.log('File parsed successfully:', parseResult.text);
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
      handleCloseModal();
      try {
        const parseResponse = await fetch('http://localhost:5000/callparse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Specify JSON content type
          },
          body: JSON.stringify({ filePath: currFile }), // Send filePath as JSON
        });
    
        if (!parseResponse.ok) {
          throw new Error('Failed to re-scan the file');
        }
    
        const parseResult = await parseResponse.json();
        setDisplayedText(""); // Clear displayed text for re-animation
        // Clear previous displayed text
        setParsedText(parseResult.text); // Update the parsed text
        setShowModal(true);
      } catch (error) {
        console.error('Error during re-scan:', error);
      }
    };

    
    const onsave = async () => {
      try {
        // Prepare the data as JSON
        const payload = {
          filePath: currFile, // Send the current file path
          parsedText, // Send the parsed text
          currDate,
        };
    
        // Sending the POST request with JSON
        const onsaveresponse = await fetch('http://localhost:5000/saveandexit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Specify JSON content type
          },
          body: JSON.stringify(payload), // Convert the payload to JSON
        });
    
        if (onsaveresponse.ok) {
          const responseData = await onsaveresponse.json();
          console.log('Successfully saved:', responseData);
    
          // Clear form data and states
          setParsedText("");
          setCurrFile("");
          setFile(null);
          setDisplayedText("");
          setSaveEnabled(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input field visually
          }
        } else {
          console.error('Failed to save data');
        }
        
      } catch (error) {
        console.error('Error during saving:', error);
      }
    };


    

    useEffect(() => {
      if (showModal && parsedText) {
          const words = parsedText.split(" ");
          let currentIndex = 0;

          const interval = setInterval(() => {
              if (currentIndex < words.length) {
                  setDisplayedText((prev) => (prev ? `${prev} ${words[currentIndex]}` : words[currentIndex]));
                  currentIndex++;
              } else {
                  clearInterval(interval); // Stop the interval when all words are displayed
              }
          }, 100); 
          return () => clearInterval(interval); // Cleanup interval on modal close
      }
  }, [showModal, parsedText]);
    
  return (
    <>
      <div className="scan new">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label htmlFor="note">Create a new scan:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            required
          />
          <button type="submit">Upload and Scan</button>
        </form>
  
        <div className="scan-footer">
          <button className="save" onClick={onsave} disabled={!saveEnabled} >Save</button>
        </div>
      </div>
  
      {/* Modal Container */}
    <div className={`parsedTextmodal-container ${showModal ? "show" : ""}`}>
    {showModal && (
    <div className="parsedText-modal">
      <h2 className="parsedText-heading">Parsed Text</h2>
      <p className="parsedText-para">{displayedText}</p>
      <div className="button-wrapper">
        <button
          className="parsedText-button accept"
          onClick={handleCloseModal}
        >
          Accept
        </button>
        <button
          className="parsedText-button Re-Scan"
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