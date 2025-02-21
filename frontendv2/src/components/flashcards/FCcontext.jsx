import React, { createContext, useContext, useState, useEffect } from 'react';

const FCcontext = createContext();

export const FCProvider = ({ children }) => {
  const [currentFC, setCurrentFC] = useState(() => {
    // Load the initial state from localStorage
    const savedFC = localStorage.getItem('currentFC');
    return savedFC ? JSON.parse(savedFC) : null;
  });

  // Save state to localStorage whenever it changes (useful for when user accidentally refreshes)
  useEffect(() => {
    console.log('currentFC:', currentFC);
    if (currentFC) {
      localStorage.setItem('currentFC', JSON.stringify(currentFC));
    } else {
      localStorage.removeItem('currentFC');
    }
  }, [currentFC]);

  return (
    <FCcontext.Provider value={{ currentFC, setCurrentFC }}>
      {children}
    </FCcontext.Provider>
  );
};

export const useFC = () => useContext(FCcontext);
