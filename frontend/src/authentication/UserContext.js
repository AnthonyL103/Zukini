import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScan } from '../scans/ScanContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    console.log("🔄 UserProvider Rendered");

    const { currentScan, setCurrentScan } = useScan();

    const [userId, setUserId] = useState(() => {
        let storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("guestUserId");

        if (!storedUserId) {
            storedUserId = `guest-${uuidv4()}`;
            sessionStorage.setItem("guestUserId", storedUserId);
        }
        console.log("🔹 Initialized userId:", storedUserId);
        return storedUserId;
    });

    const [email, setEmail] = useState(() => localStorage.getItem("email") || null);
    const [name, setName] = useState(() => localStorage.getItem("name") || null);
    const [totalScans, setTotalScans] = useState(0);
    const [totalFlashcards, setTotalFlashcards] = useState(0);
    const [totalMockTests, setTotalMockTests] = useState(0);

    /**
     * 🗑️ Deletes guest user data from the backend.
     */
    const deleteGuestData = (guestId) => {
        if (!guestId || !guestId.startsWith("guest-")) return;
        console.log(`🗑️ Attempting to delete guest user data: ${guestId}`);
        
        setCurrentScan(null);

        fetch(`https://api.zukini.com/display/deleteGuestAll?userId=${guestId}`, {
            method: 'DELETE',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
            if (!response.ok) {
                console.error("❌ Failed to delete guest data.");
            }
        })
        .catch(error => console.error("⚠️ Error deleting guest data:", error));
    };

    /**
     * 🚪 Cleans up guest data on window unload.
     */
    useEffect(() => {
        console.log("🛑 Adding beforeunload listener");

        const handleUnload = () => {
            console.log("🚪 Before unload: Deleting guest data");
            deleteGuestData(sessionStorage.getItem("guestUserId"));
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            console.log("🛑 Removing beforeunload listener");
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, []);

    /**
     * 💾 Syncs user data with localStorage and deletes guest data if necessary.
     */
    useEffect(() => {
        console.log("📝 useEffect - userId changed:", userId);

        if (!userId || userId.startsWith("guest-")) return;

        const storedUserId = localStorage.getItem("userId");
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");

        // ✅ Only update if values changed
        if (storedUserId !== userId || storedEmail !== email || storedName !== name) {
            console.log("💾 Updating localStorage with new user info");
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
        }

        // ✅ Delete guest data only if switching from guest to a real user
        if (sessionStorage.getItem("guestUserId")) {
            console.log("🗑️ Deleting guest data since user logged in");
            deleteGuestData(sessionStorage.getItem("guestUserId"));
            sessionStorage.removeItem("guestUserId");
        }
    }, [userId, email, name]);

    /**
     * 📊 Fetches user statistics when userId changes.
     */
    useEffect(() => {
        console.log("📊 useEffect - Fetching user stats");
        if (!userId || userId.startsWith("guest-")) return;

        let isMounted = true;
        console.log("✅ isMounted:", isMounted);

        const fetchUserStats = async () => {
            try {
                console.log("📡 Fetching user stats...");
                const [fcRes, mtRes, scanRes] = await Promise.allSettled([
                    fetch(`https://api.zukini.com/display/displayflashcards?userId=${userId}`),
                    fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`),
                    fetch(`https://api.zukini.com/display/displayscans?userId=${userId}`)
                ]);

                const parseResponse = async (res) => 
                    res.status === "fulfilled" && res.value.ok ? res.value.json() : [];

                const [FC, MT, Scans] = await Promise.all([
                    parseResponse(fcRes),
                    parseResponse(mtRes),
                    parseResponse(scanRes),
                ]);

                if (isMounted) {
                    console.log("📊 Updating state with fetched stats");
                    setTotalFlashcards(FC?.length || 0);
                    setTotalMockTests(MT?.length || 0);
                    setTotalScans(Scans?.length || 0);
                }
            } catch (error) {
                console.error("⚠️ Error fetching user stats:", error);
            }
        };

        fetchUserStats();
        
        return () => {
            console.log("❌ Cleaning up fetchUserStats");
            isMounted = false;
        };
    }, [userId]);

    /**
     * ✅ Memoized value to prevent unnecessary re-renders.
     */
    const contextValue = useMemo(() => ({
        userId, setUserId,
        email, setEmail,
        totalScans, setTotalScans,
        totalFlashcards, setTotalFlashcards,
        totalMockTests, setTotalMockTests,
        name, setName
    }), [userId, email, totalScans, totalFlashcards, totalMockTests, name]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
