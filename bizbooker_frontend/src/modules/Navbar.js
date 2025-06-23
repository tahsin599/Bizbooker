import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, ChevronDown, Search } from 'lucide-react';
import './Navbar.css';
import '../styles/variables.css'; // Import your CSS variables

const Navbar = ({ isAuthenticated = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthToggle, setShowAuthToggle] = useState(false); // For demo purposes

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search for:", searchQuery);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Calendar size={20} />
          </div>
          <span className="logo-text">BizzBooker</span>
        </Link>

        {/* Navigation Links - Different based on auth state */}
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/bookings" className="nav-link">Bookings</Link>
              <Link to="/services" className="nav-link">Services</Link>
              <Link to="/calendar" className="nav-link">Calendar</Link>
              <Link to="/reports" className="nav-link">Reports</Link>
            </>
          ) : (
            <>
              <Link to="/services" className="nav-link">Services</Link>
              <Link to="/providers" className="nav-link">For Businesses</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </>
          )}

          {/* Search Bar - Shows in both states */}
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder={isAuthenticated ? "Search bookings..." : "Search services..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </nav>

        {/* Right Side - Different based on auth state */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="notification-icon">
                <button className="icon-button">
                  <Bell size={20} />
                  <span className="notification-badge">3</span>
                </button>
              </div>
              
              <div className="user-profile">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                  alt="User Avatar" 
                  className="navbar-avatar"
                />
                <span className="user-name">John Doe</span>
                <ChevronDown size={16} className="dropdown-arrow" />
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-button secondary">Log In</Link>
              <Link to="/signup" className="nav-button primary">Sign Up</Link>
            </div>
          )}

          {/* Demo toggle - only for development */}
          <button 
            className="auth-toggle" 
            onClick={() => setShowAuthToggle(!showAuthToggle)}
            title="Toggle auth state for demo"
          >
            {isAuthenticated ? '👤' : '👥'}
          </button>
        </div>

        {/* Mobile menu button */}
        <div 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Demo auth state switcher - shows when clicking the toggle */}
      {showAuthToggle && (
        <div className="auth-state-switcher">
          <button onClick={() => {
            setIsMenuOpen(false);
            setShowAuthToggle(false);
          }}>
            <Link to="?auth=true">Switch to Authenticated View</Link>
          </button>
          <button onClick={() => {
            setIsMenuOpen(false);
            setShowAuthToggle(false);
          }}>
            <Link to="?auth=false">Switch to Landing View</Link>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;