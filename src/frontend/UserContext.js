import { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(() => localStorage.getItem("userId") || null);

    useEffect(() => {
        if (userId) {
            localStorage.setItem("userId", userId); // Save to localStorage
        }
    }, [userId]);

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
