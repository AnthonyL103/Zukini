import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import FilesPage from './pages/FilesPage';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import ShopPage from './pages/ShopPage';
import { UserProvider } from './UserContext';

const App = () => {
  return (
    <UserProvider>
    <Router>
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/account" element={<ShopPage />} />
      </Routes>
    </Router>
    </UserProvider>
  );
};

export default App;
