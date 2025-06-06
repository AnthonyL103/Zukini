import React from 'react';
import { Link } from 'react-router-dom';
import { FileTextOutlined, UserOutlined, HomeOutlined, BookOutlined } from '@ant-design/icons';

const Navbar = () => {
  return (
    <div className="navcontainer">
    <div className="navbar">
      <Link to="/" className="link">
        <span className="link-icon">
        <HomeOutlined />
        </span>
        <span className="link-title">Home</span>
        </Link>
      <Link to="/files" className="link">
        <span className="link-icon">
        <FileTextOutlined />
        </span>
        <span className="link-title">Files</span>
      </Link>
      <Link to="/study" className="link">
        <span className="link-icon">
        <BookOutlined />
        </span>
        <span className="link-title">Study</span>
      </Link>
      <Link to="/account" className="link">
        <span className="link-icon">
        <UserOutlined />
        </span>
        <span className="link-title">Account</span>
      </Link>
    </div>
    </div>
  );
};

export default Navbar;