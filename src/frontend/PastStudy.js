import {useState, useEffect} from 'react'
import { useUser } from './UserContext';
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
        setEntryToDelete(key);
        setEntryType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEntryToDelete(null);
        setEntryType(null);
    };

    const handleDeleteEntry = async () => {
        try {
            const endpoint =
                entryType === "flashcard"
                    ? "http://18.236.227.203:5001/deleteFC"
                    : "http://18.236.227.203:5001/deleteMT";

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: entryToDelete }),
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
           <h2>Past Flashcards</h2>
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
            {showModal && (
                <div className="deleteWarn-container">
                    <div className="deleteWarn-modal">
                        <h2 className="deleteWarn-heading">Are you sure?</h2>
                        <div className="deleteWarnbutton-wrapper">
                            <button className="deletWarn-button yes" onClick={handleDeleteEntry}>
                                Yes
                            </button>
                            <button className="deletWarn-button cancel" onClick={handleCloseModal}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
    
}

export default PastStudy;