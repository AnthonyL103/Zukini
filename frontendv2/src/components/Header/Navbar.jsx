import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../authentication/UserContext';
import { v4 as uuidv4 } from 'uuid';
import { Settings } from 'lucide-react';

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
  const hideNavbar = location.pathname === '/signup' || location.pathname === '/login';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  if (hideNavbar) {
    return null;
  }

  return (
  <header className={`w-full h-[7dvh] z-50 absolute top-0 ${
      isMenuOpen
        ? 'bg-white' 
        : isHomePage 
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0f0647] to-[#2B446F]'
  }`}>
      <div className={`max-w-7xl h-full mx-auto px-4 ${
        isMenuOpen
          ? 'bg-white'
          : isHomePage 
            ? 'bg-transparent'
            : 'bg-gradient-to-b from-[#0f0647] to-[#2B446F]'
      }`}>
        <div className={`flex h-full items-center justify-between ${
          isMenuOpen
            ? 'bg-white'
            : isHomePage 
              ? 'bg-transparent'  
              : 'bg-gradient-to-b from-[#0f0647] to-[#2B446F]'
        }`}>
          <div className="flex items-center">
            <Link 
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`text-2xl font-bold ${
                isMenuOpen 
                  ? 'text-gray-900'
                  : 'text-white'
              }`}>
              Zukini
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center hover:cursor-pointer justify-center p-2 rounded-md ${
                isMenuOpen
                  ? 'text-gray-900 hover:text-gray-700' 
                  : isHomePage 
                    ? 'text-white hover:text-gray-200'
                    : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-0 text-black' : '-translate-y-2 text-white'}`}></span>
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100 text-white'}`}></span>
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? '-rotate-45 translate-y-0 text-black' : 'translate-y-2 text-white'}`}></span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex-1 md:flex md:justify-center md:space-x-8 ${
            isHomePage ? 'bg-transparent' : 'bg-none'
          }`}>
            <Link to="/dashboard" className={`px-3 py-2 text-sm font-medium text-white hover:text-indigo-200`}>
              Dashboard
            </Link>
            <Link to="/create" className={`px-3 py-2 text-sm font-medium text-white hover:text-indigo-200`}>
              Create
            </Link>
            <Link to="/library" className={`px-3 py-2 text-sm font-medium text-white hover:text-indigo-200`}>
              Library
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className={`hidden md:flex md:items-center md:space-x-4 ${isHomePage ? 'bg-transparent' : 'bg-none'}`}>
            {!isGuestUser ? (
              <>
                <Link 
                  to="/account" 
                  className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isHomePage ? 'text-white hover:text-indigo-200' : 'text-white hover:text-indigo-200'}`}
                >
                  <Settings size={20} />
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`px-3 py-2 text-sm font-medium hover:cursor-pointer ${isHomePage ? 'text-white hover:text-indigo-200' : 'text-white hover:text-indigo-200'}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
              <Link 
                to="/login" 
                className={`px-3 py-2 text-sm font-medium ${isHomePage ? 'text-white hover:text-indigo-200' : 'text-white hover:text-indigo-200'}`}>
                Login
              </Link>
              
              <Link
                to="/signup"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                Sign up
              </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`
            absolute left-0 right-0 bg-white shadow-lg md:hidden 
            transition-all duration-300 ease-in-out
            ${isMenuOpen 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-full opacity-0 pointer-events-none'}
          `}
          style={{
            top: '7dvh',
            maxHeight: 'calc(100vh - 7dvh)'
          }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 items-center flex flex-col">
          
          {!isGuestUser ? (
            <>
              <Link
                to="/account"
                className="block text-center px-3 py-6 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <Link 
                to="/"
                onClick={handleLogout} 
                className="block text-center px-3 py-6 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md w-full">
                Logout
              </Link>
            </>
            ) : (
              <>
              
              <div className="w-full max-w-sm">
                <div className='flex w-full justify-between items-center pb-12 gap-4'>
                  <Link 
                    to="/login" 
                    className="block text-center flex-1 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className="block text-center flex-1 px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              </>
            )}

            <Link
              to="/create"
              className="block text-center px-3 py-6 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </Link>
            <Link
              to="/library"
              className="block text-center px-3 py-6 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Library
            </Link>
            <Link
              to="/dashboard"
              className="block text-center px-3 py-6 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-600 duration-250 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
