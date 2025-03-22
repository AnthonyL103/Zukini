import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScan } from '../scans/ScanContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const { setCurrentScan } = useScan();

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
    const [isforgot, setisforgot] = useState(false);


    const fetchUserStats = useCallback(async () => {
        if (!userId) return;
        
        try {
            const [fcRes, mtRes, scanRes] = await Promise.allSettled([
                fetch(`https://api.zukini.com/display/displayflashcards?userId=${userId}`),
                fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`),
                fetch(`https://api.zukini.com/display/displayscans?userId=${userId}`)
            ]);

            const parseResponse = async (res) => 
                res.status === "fulfilled" && res.value.ok ? await res.value.json() : [];

            const [FC, MT, Scans] = await Promise.all([
                parseResponse(fcRes),
                parseResponse(mtRes), 
                parseResponse(scanRes)
            ]);

            setTotalFlashcards(FC?.length || 0);
            setTotalMockTests(MT?.length || 0); 
            setTotalScans(Scans?.length || 0);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    }, [userId]);
    
    
    const deleteGuestData = (guestId) => {
        if (!guestId || !guestId.startsWith("guest-")) return;
        
        setCurrentScan(null);

        fetch(`https://api.zukini.com/display/deleteGuestAll?userId=${guestId}`, {
            method: 'DELETE',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
        })
    };

  
    useEffect(() => {
      const handleUnload = () => {
          const guestId = sessionStorage.getItem("guestUserId");
          if (guestId && guestId.startsWith("guest-")) {
              navigator.sendBeacon(
                  `https://api.zukini.com/display/deleteGuestAll?userId=${guestId}`,
                  JSON.stringify({}) 
              );
          }
      };
      
      window.addEventListener("beforeunload", handleUnload);
      
      return () => {
          window.removeEventListener("beforeunload", handleUnload);
      };
  }, []);
      


    useEffect(() => {

        if (!userId || userId.startsWith("guest-")) return;

        const storedUserId = localStorage.getItem("userId");
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");

        if (storedUserId !== userId || storedEmail !== email || storedName !== name) {
            console.log("💾 Updating localStorage with new user info");
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
        }

        if (sessionStorage.getItem("guestUserId")) {
            console.log("🗑️ Deleting guest data since user logged in");
            deleteGuestData(sessionStorage.getItem("guestUserId"));
            sessionStorage.removeItem("guestUserId");
        }
    }, [userId, email, name]);


    useEffect(() => {
        const fetchUserStats = async () => {
          if (!userId) return;
          
          try {
            const [fcRes, mtRes, scanRes] = await Promise.allSettled([
              fetch(`https://api.zukini.com/display/displayflashcards?userId=${userId}`),
              fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`),
              fetch(`https://api.zukini.com/display/displayscans?userId=${userId}`)
            ]);
    
            const parseResponse = async (res) => 
              res.status === "fulfilled" && res.value.ok ? await res.value.json() : [];
    
            const [FC, MT, Scans] = await Promise.all([
              parseResponse(fcRes),
              parseResponse(mtRes), 
              parseResponse(scanRes)
            ]);
    
            setTotalFlashcards(FC?.length || 0);
            setTotalMockTests(MT?.length || 0); 
            setTotalScans(Scans?.length || 0);
          } catch (error) {
            console.error('Error fetching user stats:', error);
          }
        };
    
        fetchUserStats();
      }, [userId]);

    const contextValue = useMemo(() => ({
        userId, setUserId,
        email, setEmail,
        totalScans, setTotalScans,
        totalFlashcards, setTotalFlashcards,
        totalMockTests, setTotalMockTests,
        name, setName,
        isforgot, setisforgot,
        fetchUserStats
    }), [userId, email, totalScans, totalFlashcards, totalMockTests, name, isforgot]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
