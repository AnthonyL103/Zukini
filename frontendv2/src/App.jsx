import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Header/Navbar';
import FilesPage from './components/pages/FilesPage';
import HomePage from './components/pages/HomePage';
import StudyPage from './components/pages/StudyPage';
import AccountPage from './components/pages/AccountPage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import { UserProvider } from './components/authentication/UserContext';

const App = () => {
  return (
    <UserProvider>
    <Router>
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
    </UserProvider>
  );
};

export default App;
