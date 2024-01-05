// src/components/Header.js

import React from "react";

const Header = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <img src="/aldo-logo.png" alt="ALDO Logo" className="logo-img" />
      </div>
      <nav>
        <ul className="nav-list">
          <li>
            <a href="/">New Arrivals</a>
          </li>
          <li>
            <a href="/women">Women</a>
          </li>
          <li>
            <a href="/men">Men</a>
          </li>
          <li>
            <a href="/boot-edit">The Boot Edit</a>
          </li>
          <li>
            <a href="/sale">Sale</a>
          </li>
        </ul>
      </nav>
      <div className="nav-icons">
        <span>🔍</span>
        <span>❤️</span>
        <span>🛍️</span>
      </div>
    </header>
  );
};

export default Header;
