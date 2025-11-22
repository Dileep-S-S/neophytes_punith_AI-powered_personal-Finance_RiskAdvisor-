import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Header.css";
import logo from "./logo.jpg";

function Header() {

  function handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    alert("Logged out!");
    window.location.href = "/";   // guaranteed redirect
  }

  return (
    <nav className="header-nav d-flex align-items-center px-3">

      <Link className="me-auto logo-link" to="/dashboard">
        <img src={logo} alt="Logo" className="header-logo" />
      </Link>

      <ul className="nav d-flex align-items-center">
        <li className="nav-item">
          <Link className="nav-link text-white" to="/chatbot">Chatbot</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/overview">Overview</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/events">Events</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/account">Account</Link>
        </li>

        <li className="nav-item ms-3">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
