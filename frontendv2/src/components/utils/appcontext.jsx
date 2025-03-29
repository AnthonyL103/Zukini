import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Get initial state from localStorage if available
const getInitialState = () => {
  try {
    const savedState = localStorage.getItem('appState');
    return savedState ? JSON.parse(savedState) : {
      currentScan: null,
      currentFC: null,
      currentMT: null,
      totalScans: 0,
      totalFlashcards: 0,
    };
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return {
      currentScan: null,
      currentFC: null,
      currentMT: null,
      totalScans: 0,
      totalFlashcards: 0,
    };
  }
};

// Action types
const ActionTypes = {
  SET_CURRENT_SCAN: 'SET_CURRENT_SCAN',
  SET_CURRENT_FC: 'SET_CURRENT_FC',
  SET_CURRENT_MT: 'SET_CURRENT_MT',
  SET_TOTAL_SCANS: 'SET_TOTAL_SCANS',
  SET_TOTAL_FLASHCARDS: 'SET_TOTAL_FLASHCARDS',
  RESET_FC: 'RESET_FC',
  RESET_MT: 'RESET_MT',
  RESET_ALL: 'RESET_ALL',
};

// Reducer function
function appReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case ActionTypes.SET_CURRENT_SCAN:
      newState = { ...state, currentScan: action.payload };
      break;
    case ActionTypes.SET_CURRENT_FC:
      newState = { ...state, currentFC: action.payload };
      break;
    case ActionTypes.SET_CURRENT_MT:
      newState = { ...state, currentMT: action.payload };
      break;
    case ActionTypes.SET_TOTAL_SCANS:
      newState = { ...state, totalScans: action.payload };
      break;
    case ActionTypes.SET_TOTAL_FLASHCARDS:
      newState = { ...state, totalFlashcards: action.payload };
      break;
    case ActionTypes.RESET_FC:
      newState = { ...state, currentFC: null };
      break;
    case ActionTypes.RESET_MT:
      newState = { ...state, currentMT: null };
      break;
    case ActionTypes.RESET_ALL:
      newState = { 
        ...state, 
        currentFC: null, 
        currentMT: null 
      };
      break;
    default:
      return state;
  }
  
  // Persist state to localStorage
  localStorage.setItem('appState', JSON.stringify(newState));
  return newState;
}

// Create context
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // This effect ensures state is saved whenever it changes
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom hooks to use state and dispatch
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  return context;
}

// Action creators
export const AppActions = {
  setCurrentScan: (scan) => ({
    type: ActionTypes.SET_CURRENT_SCAN,
    payload: scan
  }),
  setCurrentFC: (fc) => ({
    type: ActionTypes.SET_CURRENT_FC,
    payload: fc
  }),
  setCurrentMT: (mt) => ({
    type: ActionTypes.SET_CURRENT_MT,
    payload: mt
  }),
  setTotalScans: (count) => ({
    type: ActionTypes.SET_TOTAL_SCANS,
    payload: count
  }),
  setTotalFlashcards: (count) => ({
    type: ActionTypes.SET_TOTAL_FLASHCARDS,
    payload: count
  }),
  resetFC: () => ({ type: ActionTypes.RESET_FC }),
  resetMT: () => ({ type: ActionTypes.RESET_MT }),
  resetAll: () => ({ type: ActionTypes.RESET_ALL }),
};