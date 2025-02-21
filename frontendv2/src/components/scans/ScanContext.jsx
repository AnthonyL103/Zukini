import React, { createContext, useContext, useState, useEffect } from 'react';

const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
  const [currentScan, setCurrentScan] = useState(() => {
    // Load the initial state from localStorage
    const savedScan = localStorage.getItem('currentScan');
    return savedScan ? JSON.parse(savedScan) : null;
  });

  // Save state to localStorage whenever it changes (usefule for when user accidentilly refreshed or something)
  useEffect(() => {
    console.log('currentScan:', currentScan);
    if (currentScan) {
      localStorage.setItem('currentScan', JSON.stringify(currentScan));
    } else {
      localStorage.removeItem('currentScan');
    }
  }, [currentScan]);

  return (
    <ScanContext.Provider value={{ currentScan, setCurrentScan }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);
