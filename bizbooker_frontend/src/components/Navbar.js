import './Navbar.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar } from 'lucide-react';


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            // Redirect or handle search logic here
            console.log("Search for:", query);
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link to="/" className="logo">
                    <Calendar size={24} className="calendar-icon" />
                    <span><strong>Biz</strong>Booker</span>
                </Link>

                <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
                    <Link to="/services">Services</Link>
                    <Link to="/providers">For Businesses</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>

                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit">🔍</button>
                    </form>
                </nav>

                <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
