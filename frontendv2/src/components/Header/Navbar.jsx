import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-none shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <div className="w-32 h-8 bg-gray-200 rounded">
                {/* Placeholder for logo */}
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black focus:outline-none"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex-1 md:flex md:justify-center md:space-x-8">
            <Link to="/files" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium">
              Files
            </Link>
            <Link to="/study" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium">
              Study
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium">
              Account
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium">
              Login
            </button>
            <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
              Sign up
            </button>
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
            <button className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md">
              Login
            </button>
            <button className="w-full text-left px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;