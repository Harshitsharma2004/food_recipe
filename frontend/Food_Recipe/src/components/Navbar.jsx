import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import Modal from "./Modal";
import InputForm from "./InputForm";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { toast } from "react-toastify";
import { CgProfile } from "react-icons/cg";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Login Modal state
  const [menuOpen, setMenuOpen] = useState(false); // Mobile Menu state
  const menuRef = useRef();
  const navigate = useNavigate();

  // True means user is logged in if token exists in localStorage
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem("token"));

  // Sync login state across tabs/windows
  useEffect(() => {
    const syncLogin = () => {
      const token = localStorage.getItem("token");
      setIsLogin(!!token);
    };

    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  // When login button clicked:
  // - if logged out: open login modal
  // - if logged in: do nothing (profile icon will be shown separately)
  const handleLoginClick = () => {
    if (!isLogin) {
      setIsOpen(true);
      setMenuOpen(false);
    }
  };

  // Close mobile menu on outside click
  const handleOutsideClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <>
      <header>
        <h2>Plated Poetry</h2>
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`} ref={menuRef}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/myRecipe"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={(e) => {
                if (!isLogin) {
                  e.preventDefault();
                  setIsOpen(true);
                  setMenuOpen(false);
                } else {
                  setMenuOpen(false);
                }
              }}
            >
              My Recipe
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/favRecipe"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={(e) => {
                if (!isLogin) {
                  e.preventDefault();
                  setIsOpen(true);
                  setMenuOpen(false);
                } else {
                  setMenuOpen(false);
                }
              }}
            >
              Favourites
            </NavLink>
          </li>
          <li>
            {isLogin ? (
              <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="profile-icon">
                <CgProfile />
              </NavLink>
            ) : (
              <button className="login" onClick={handleLoginClick}>
                Login
              </button>
            )}
          </li>
        </ul>
      </header>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <InputForm
            setIsOpen={setIsOpen}
            onLoginSuccess={() => {
              setIsLogin(true);
              setIsOpen(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}

export default Navbar;
