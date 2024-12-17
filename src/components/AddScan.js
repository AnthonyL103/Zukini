import {useState} from 'react';

const AddScan = () => {
    const [scanText, setScanText] = useState('');
    const [file, setFile] = useState(null)
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Update the state with the selected file
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form behavior
    
        const formData = new FormData(); // Create a form data object to send the file
        formData.append('file', file); // Append the file with the name 'file'
    
        try {
          // Send the file to the server
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
          });
    
          const result = await response.json(); // Parse the server's JSON response
          //setScanText(result.text); // Set the extracted text in state
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
    
    return(
    <div className= "scan new">
            <form onSubmit={handleSubmit} enctype="multipart/form-data">
                <label for="note">Create a new scan:</label>
                <input type="file" accept="image/*"  onChange= {handleFileChange} required></input>
                <button type="submit">Upload and Scan</button>
            </form>
            <div className="scan-footer">
                <button className="save">Save</button>
            </div>
    </div>
    );
};
  

export default AddScan;