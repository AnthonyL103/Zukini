import React from 'react';
import { Link } from 'react-router-dom';
import { FileTextOutlined, ShoppingCartOutlined, HomeOutlined, BookOutlined } from '@ant-design/icons';

const Navbar = () => {
  return (
    <div className="navbar-container">
      <Link to="/" className="navbutton">
        <HomeOutlined className="icon" />
      </Link>
      <Link to="/scans" className="navbutton">
        <FileTextOutlined className="icon" />
      </Link>
      <Link to="/study" className="navbutton">
        <BookOutlined className="icon" />
      </Link>
      <Link to="/shop" className="navbutton">
        <ShoppingCartOutlined className="icon" />
      </Link>
    </div>
  );
};

export default Navbar;
