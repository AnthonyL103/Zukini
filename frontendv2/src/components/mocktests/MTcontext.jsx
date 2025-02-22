import React, { createContext, useContext, useState, useEffect } from 'react';

const MTContext = createContext();

export const MTProvider = ({ children }) => {
  const [currentMT, setCurrentMT] = useState(() => {
    const savedMT = localStorage.getItem('currentMT');
    return savedMT ? JSON.parse(savedMT) : null;
  });

  useEffect(() => {
    console.log('currentMT:', currentMT);
    if (currentMT) {
      localStorage.setItem('currentMT', JSON.stringify(currentMT));
    } else {
      localStorage.removeItem('currentMT');
    }
  }, [currentMT]);

  return (
    <MTContext.Provider value={{ currentMT, setCurrentMT }}>
      {children}
    </MTContext.Provider>
  );
};

export const useMT = () => useContext(MTContext);
