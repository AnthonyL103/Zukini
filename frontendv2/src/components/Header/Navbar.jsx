import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../authentication/UserContext';
import { v4 as uuidv4 } from 'uuid';

const Navbar = () => {
      
  const navigate = useNavigate();
  const { userId, setUserId, setEmail, setTotalScans, setTotalFlashcards, setTotalMockTests, setName, setisforgot} = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {

    // Clear all stored user data
    localStorage.removeItem("currentScan");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    sessionStorage.clear();

    // Generate a new guest user ID *after* clearing session storage
    const newGuestId = `guest-${uuidv4()}`;
    sessionStorage.setItem("guestUserId", newGuestId);

    // Reset state values
    setUserId(newGuestId);
    setEmail(null);
    setName(null);
    setTotalScans(0);
    setTotalFlashcards(0);
    setTotalMockTests(0);
    setisforgot(false);

    // Reload the page *after* all state updates to ensure a clean reset
    setTimeout(() => {
        window.location.reload();
    }, 100); // Delay to allow state updates to apply before reload
};


const [isGuestUser, setIsGuestUser] = useState(false);

useEffect(() => {
    console.log("Navbar Rendered", { userId });
  setIsGuestUser(userId && typeof userId === "string" && userId.startsWith("guest-"));
}, [userId]); // Only update when `userId` changes


  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className={`w-full h-[7dvh] z-50 absolute top-0 ${isHomePage ? 'bg-transparent' : 'bg-white'}`}>
      <div className={`max-w-7xl h-full mx-auto px-4 ${isHomePage ? 'bg-transparent' : 'bg-white'}`}>
        <div className={`flex h-full items-center justify-between ${isHomePage ? 'bg-transparent' : 'bg-white'}`}>
          <div className="flex items-center">
            <Link to="/" className={`text-2xl font-bold ${isHomePage ? 'text-white' : 'text-gray-900'}`}>
              Zukini
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${isHomePage ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'}`}
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex-1 md:flex md:justify-center md:space-x-8 ${isHomePage ? 'bg-transparent' : 'bg-white'}`}>
            <Link to="/files" className={`px-3 py-2 text-sm font-medium ${isHomePage ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'}`}>
              Files
            </Link>
            <Link to="/study" className={`px-3 py-2 text-sm font-medium ${isHomePage ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'}`}>
              Study
            </Link>
            <Link to="/account" className={`px-3 py-2 text-sm font-medium ${isHomePage ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'}`}>
              Account
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className={`hidden md:flex md:items-center md:space-x-4 ${isHomePage ? 'bg-transparent' : 'bg-white'}`}>
            {!isGuestUser ? (
              <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black">
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black">
                  Login
                </button>
                <button onClick={() => navigate("/signup")} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`absolute left-0 right-0 bg-white shadow-lg md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/files"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Files
            </Link>
            <Link
              to="/study"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Study
            </Link>
            <Link
              to="/account"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Account
            </Link>

            {!isGuestUser ? (
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md">
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md">
                  Login
                </button>
                <button onClick={() => navigate("/signup")} className="w-full text-left px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md">
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
