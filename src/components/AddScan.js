import {useState} from 'react';

const AddScan = () => {
    const [scanText, setScanText] = useState('');
    
    return(
    <div className= "scan new">
            <form action="/note-scans" method="post" enctype="multipart/form-data">
                <label for="note">Create a new scan:</label>
                <input type="file" accept="image/*" required></input>
            <button type="submit">Upload and Scan</button>
            </form>
            <div className="scan-footer">
                <button className="save">Save</button>
            </div>
    </div>
    );
};
export default AddScan;