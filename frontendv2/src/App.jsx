import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import Navbar from './components/Header/Navbar';
import HomePage from './components/pages/HomePage';
import StudyPage from './components/Study/StudyPage';
import AccountPage from './components/pages/AccountPage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import { UserProvider } from './components/authentication/UserContext';
import { AppStateProvider } from './components/utils/appcontext';

import Dashboard from './components/Dashboard/Dashboard';
import Library from './components/Library/Library';
import Create from './components/Create/Create';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <UserProvider>
        <AppStateProvider>
            <Router>
              <Navbar />
              <AnimatedRoutes />
            </Router>
            </AppStateProvider>
    </UserProvider>
  );
};

export default App;
