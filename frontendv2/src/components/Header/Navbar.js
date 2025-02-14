import React from 'react';
import { Link } from 'react-router-dom';
import { FileTextOutlined, UserOutlined, HomeOutlined, BookOutlined } from '@ant-design/icons';

const Navbar = () => {
  return (
    <div className="bg-background static max-w-[1200px] mx-auto p-4">
      <div className="p-2 bg-[#67d7cc] rounded-2xl static flex items-center justify-around shadow-lg">
        <Link to="/" className="inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-black hover:w-[130px] hover:bg-surface focus:outline-none focus:w-[130px]">
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <HomeOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Home
          </span>
        </Link>

        <Link to="/files" className="inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-black hover:w-[130px] hover:bg-surface focus:outline-none focus:w-[130px]">
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <FileTextOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Files
          </span>
        </Link>

        <Link to="/study" className="inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-black hover:w-[130px] hover:bg-surface focus:outline-none focus:w-[130px]">
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <BookOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Study
          </span>
        </Link>

        <Link to="/account" className="inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-black hover:w-[130px] hover:bg-surface focus:outline-none focus:w-[130px]">
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <UserOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Account
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;