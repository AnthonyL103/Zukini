import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  currentScan: null,
  currentFC: null,
  currentMT: null,
  totalScans: 0,
  totalFlashcards: 0,
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
  switch (action.type) {
    case ActionTypes.SET_CURRENT_SCAN:
      return { ...state, currentScan: action.payload };
    case ActionTypes.SET_CURRENT_FC:
      return { ...state, currentFC: action.payload };
    case ActionTypes.SET_CURRENT_MT:
      return { ...state, currentMT: action.payload };
    case ActionTypes.SET_TOTAL_SCANS:
      return { ...state, totalScans: action.payload };
    case ActionTypes.SET_TOTAL_FLASHCARDS:
      return { ...state, totalFlashcards: action.payload };
    case ActionTypes.RESET_FC:
      return { ...state, currentFC: null };
    case ActionTypes.RESET_MT:
      return { ...state, currentMT: null };
    case ActionTypes.RESET_ALL:
      return { 
        ...state, 
        currentFC: null, 
        currentMT: null 
      };
    default:
      return state;
  }
}

// Create context
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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