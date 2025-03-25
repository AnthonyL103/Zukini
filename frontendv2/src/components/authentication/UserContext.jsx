import { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
    const [subscriptionStatus, setSubscriptionStatus] = useState('free');
    const [isPremium, setIsPremium] = useState(false);
    const [isforgot, setisforgot] = useState(false);
    
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
            console.log("Updating localStorage with new user info");
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
        }

        if (sessionStorage.getItem("guestUserId")) {
            console.log("Deleting guest data since user logged in");
            deleteGuestData(sessionStorage.getItem("guestUserId"));
            sessionStorage.removeItem("guestUserId");
        }
    }, [userId, email, name]);

    const fetchUserStats = async () => {
        if (!userId) return;
        
        try {
            //promise all setttled lets us use the data even if a fetch fials and we can do it parallely meaning 500 ms vs 
            ///doing fetch all all seqentially which is x3 times slower here
            const [fcRes, mtRes, scanRes, subRes] = await Promise.allSettled([
                fetch(`https://api.zukini.com/display/displayflashcards?userId=${userId}`),
                fetch(`https://api.zukini.com/display/displaymocktests?userId=${userId}`),
                fetch(`https://api.zukini.com/display/displayscans?userId=${userId}`),
                fetch(`https://api.zukini.com/account/stripe/subscription-status?userId=${userId}`)
            ]);

            const parseResponse = async (res) => 
                res.status === "fulfilled" && res.value.ok ? await res.value.json() : [];

            //this is where we handle the data from the fetches
            const [FC, MT, Scans, SubStatus] = await Promise.all([
                parseResponse(fcRes),
                parseResponse(mtRes), 
                parseResponse(scanRes),
                parseResponse(subRes)
            ]);

            setTotalFlashcards(FC?.length || 0);
            setTotalMockTests(MT?.length || 0); 
            setTotalScans(Scans?.length || 0);
            
            if (SubStatus?.success) {
                setSubscriptionStatus(SubStatus.status || 'free');
                setIsPremium(SubStatus.status === 'premium');
            } else {
                setSubscriptionStatus('free');
                setIsPremium(false);
            }
            
            console.log(`User stats fetched - Scans: ${Scans?.length || 0}, FC: ${FC?.length || 0}, MT: ${MT?.length || 0}, Subscription: ${SubStatus?.status || 'free'}`);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            setSubscriptionStatus('free');
            setIsPremium(false);
        }
    };

    useEffect(() => {
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
        subscriptionStatus, setSubscriptionStatus,
        isPremium, setIsPremium,
        fetchUserStats
    }), [userId, email, totalScans, totalFlashcards, totalMockTests, name, isforgot, subscriptionStatus, isPremium]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};