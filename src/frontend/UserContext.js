import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create Context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(() => {
        let storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("guestUserId");
        
        if (!storedUserId) {
            storedUserId = `guest-${uuidv4()}`;
            sessionStorage.setItem("guestUserId", storedUserId);
        }
        return storedUserId;
    });

    const [email, setEmail] = useState(() => localStorage.getItem("email") || null);
    const [totalScans, setTotalScans] = useState(0);
    const [totalFlashcards, setTotalFlashcards] = useState(0);
    const [totalMockTests, setTotalMockTests] = useState(0);

    // Save userId and email to localStorage
    
    useEffect(() => {
        if (userId.startsWith("guest-")) {
            sessionStorage.setItem("guestUserId", userId);
        } else {
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", email);
            sessionStorage.removeItem("guestUserId"); // Remove guest ID if user logs in
        }
    }, [userId, email]);

    // Fetch total scans, flashcards, and mock tests when userId changes
    useEffect(() => {
        if (!userId) return;

        const fetchUserStats = async () => {
            try {
                const [fcRes, mtRes, scanRes] = await Promise.all([
                    fetch(`http://18.236.227.203:5001/displayflashcards?userId=${userId}`),
                    fetch(`http://18.236.227.203:5001/displaymocktests?userId=${userId}`),
                    fetch(`http://18.236.227.203:5001/displayscans?userId=${userId}`)
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
            totalMockTests, setTotalMockTests
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook to use UserContext
export const useUser = () => useContext(UserContext);
