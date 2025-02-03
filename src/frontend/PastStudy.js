import {useState, useEffect} from 'react'
import { useUser } from './UserContext';
import MTentry from './MTentry';
import FCentry from './FCentry';
const PastStudy = () => {
    const [FCentries, setFCentries] = useState([]);
    const [MTentries, setMTentries] = useState([]);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [entryType, setEntryType] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { userId } = useUser();
    
    useEffect(() => {
        const fetchFC = async () => {
            try {
                const response = await fetch(`http://18.236.227.203:5001/displayflashcards?userId=${userId}`);;
                if (!response.ok) {
                  throw new Error('Failed to fetch fc');
                }
                const data = await response.json();
                console.log('Fetched fc:', data);
                setFCentries(data);
              } catch (error) {
                console.error('Error fetching fc:', error);
              }
        };
        
        
        const fetchMT = async () => {
            try {
                const response = await fetch(`http://18.236.227.203:5001/displaymocktests?userId=${userId}`);;
                if (!response.ok) {
                  throw new Error('Failed to fetch mt');
                }
                const data = await response.json();
                console.log('Fetched mt:', data);
                setMTentries(data);
              } catch (error) {
                console.error('Error fetching mt:', error);
              }
        };
        
        fetchFC();
        fetchMT();
    }, [userId])
    
    const displayModal = (key, type) => {
        console.log("made it");
        setEntryToDelete(key);
        setEntryType(type);
        setShowModal(true);
        console.log(showModal);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEntryToDelete(null);
        setEntryType(null);
    };

    const handleDeleteEntry = async () => {
        try {
            let endpoint = "";
            
            if (entryType === "flashcard") {
                endpoint = "http://18.236.227.203:5001/deleteFC";
            } else if (entryType === "mocktest") {
                endpoint = "http://18.236.227.203:5001/deleteMT";
            } else {
                console.error("Unknown entry type:", entryType);
                return; 
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, key: entryToDelete }),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete ${entryType}`);
            }

            if (entryType === "flashcard") {
                setFCentries((prev) => prev.filter((entry) => entry.flashcardkey !== entryToDelete));
            } else {
                setMTentries((prev) => prev.filter((entry) => entry.mocktestkey !== entryToDelete));
            }

            console.log(`${entryType} deleted successfully:`, entryToDelete);
            setShowModal(false);
        } catch (error) {
            console.error(`Error deleting ${entryType}:`, error);
        }
    };
    
    return (
        <div className="container">
           <h2>Past Flashcards:</h2>
            <div className="FCentries-list">
                {FCentries.map((entry) => (
                    <FCentry
                        key={entry.flashcardkey}
                        flashcardkey={entry.flashcardkey}
                        filepath={entry.filepath}
                        scanname={entry.scanname}
                        date={entry.date}
                        entryType="flashcard"
                        displayModal={displayModal}
                    />
                ))}
            </div>
            <h2>Past Mocktests:</h2>
            <div className="MTentries-list">
                {MTentries.map((entry) => (
                    <MTentry
                        key={entry.mocktestkey}
                        flashcardkey={entry.mocktestkey}
                        filepath={entry.filepath}
                        scanname={entry.scanname}
                        date={entry.date}
                        entryType="mocktest"
                        displayModal={displayModal}
                    />
                ))}
            </div>
        <div className={`deleteWarn-container ${showModal ? "show" : ""}`}>
        {showModal && (
        <div className="deleteWarn-modal">
        <h2 className="deleteWarn-heading">Are you Sure?</h2>
        <div className="deleteWarnbutton-wrapper">
            <button
            className="deletWarn-button yes" // Updated to match CSS
            onClick={handleDeleteEntry}
            >
            Yes
            </button>
            <button
            className="deletWarn-button cancel" // Updated to match CSS
            onClick={handleCloseModal}
            >
            No
            </button>
        </div>
        </div>
        )}
    </div>
</div>
);
    
    
}

export default PastStudy;