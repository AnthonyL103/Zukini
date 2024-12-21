import {useState, useEffect} from 'react';

const AddScan = () => {
    const [showModal, setShowModal] = useState(false);
    const [parsedText, setParsedText] = useState("");
    const [file, setFile] = useState(null)
    const [displayedText, setDisplayedText] = useState("");
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Update the state with the selected file
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form behavior
    
        const formData = new FormData(); // Create a form data object to send the file
        formData.append('file', file); // Append the file with the name 'file'
    
        try {
          // Send the file to the server
          const response = await fetch('http://localhost:5001/upload', {
            method: 'POST',
            body: formData,
          });
    
          const result = await response.json(); // Parse the server's JSON response
          setParsedText(result.text);
          //setScanText(result.text); // Set the extracted text in state
          setShowModal(true)
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
    
    const handleCloseModal = () => {
        setDisplayedText("");
        setShowModal(false); // Close the modal
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
          }, 300); 
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
            required
          />
          <button type="submit">Upload and Scan</button>
        </form>
  
        <div className="scan-footer">
          <button className="save">Save</button>
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
          onClick={handleCloseModal}
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