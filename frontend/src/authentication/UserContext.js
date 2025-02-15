import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScan } from '../scans/ScanContext';


// Create Context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { currentScan, setCurrentScan } = useScan(); 
    const [userId, setUserId] = useState(() => {
        let storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("guestUserId");
        
        if (!storedUserId) {
            storedUserId = `guest-${uuidv4()}`;
            sessionStorage.setItem("guestUserId", storedUserId);
        }
        return storedUserId;
    });

    const [email, setEmail] = useState(() => localStorage.getItem("email") || null);
    const [name, setName] = useState(() => localStorage.getItem("name") || null);
    const [totalScans, setTotalScans] = useState(0);
    const [totalFlashcards, setTotalFlashcards] = useState(0);
    const [totalMockTests, setTotalMockTests] = useState(0);
    
    const deleteGuestData = (guestId) => {
        if (!guestId || !guestId.startsWith("guest-")) return;
        setCurrentScan(null);

        console.log(`Attempting to delete guest user data: ${guestId}`);
        
        fetch(`https://api.zukini.com/display/deleteGuestAll?userId=${guestId}`, {
            method: 'DELETE',
            keepalive: true,  // Ensures the request completes before unload
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => {
            if (!response.ok) {
                console.error("Failed to delete guest data.");
            }
            
        }).catch(error => console.error("Error deleting guest data:", error));
    };
    useEffect(() => {
        const handleUnload = () => {
            deleteGuestData(sessionStorage.getItem("guestUserId"));
        };


        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, []);

    
    // Save userId and email to localStorage
    
    useEffect(() => {
        if (userId.startsWith("guest-")) {
            sessionStorage.setItem("guestUserId", userId);
        } else {
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
            if (sessionStorage.getItem("guestUserId")) {
                deleteGuestData(sessionStorage.getItem("guestUserId"));
                sessionStorage.removeItem("guestUserId"); 
                
            }
        }
        
    }, [userId, email]);

    // Fetch total scans, flashcards, and mock tests when userId changes
    
    useEffect(() => {
        if (!userId) return;

        const fetchUserStats = async () => {
            try {
                const [fcRes, mtRes, scanRes] = await Promise.all([
                    fetch(`https://api.zukini.com/flashcards/displayflashcards?userId=${userId}`),
                    fetch(`https://api.zukini.com/mocktests/displaymocktests?userId=${userId}`),
                    fetch(`https://api.zukini.com/scans/displayscans?userId=${userId}`)
                ]);

                if (!fcRes.ok || !mtRes.ok || !scanRes.ok) {
                    throw new Error("Failed to fetch one or more resources");
                }

                const FC = await fcRes.json();
                const MT = await mtRes.json();
                const Scans = await scanRes.json();

                setTotalFlashcards(FC?.length || 0);
                setTotalMockTests(MT?.length || 0);
                setTotalScans(Scans?.length || 0);
            } catch (error) {
                console.error("Error fetching user stats:", error);
            }
        };

        fetchUserStats();
    }, [userId]);

    return (
        <UserContext.Provider value={{
            userId, setUserId,
            email, setEmail,
            totalScans, setTotalScans,
            totalFlashcards, setTotalFlashcards,
            totalMockTests, setTotalMockTests,
            name, setName
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook to use UserContext
export const useUser = () => useContext(UserContext);
