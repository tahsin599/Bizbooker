import { motion } from 'framer-motion';
import { Calendar, Users, Shield } from 'lucide-react';
import './LandingPage.css';
import TextRotator from './TextRotator';

const LandingPage = () => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const rotatingPhrases = [
    'local services',
    'trusted professionals',
    'available providers',
    'verified businesses'
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="hero-text"
          >
            <h1>
              <span className="gradient-text">BizBooker</span><br />
              Connect with <TextRotator phrases={rotatingPhrases} /> instantly
            </h1>
            <p className="subtitle">
              The modern platform that connects customers with top-rated service providers.
            </p>
            <a href="/signup" className="cta-button">Get Started</a>
          </motion.div>
        </div>
      </section>

      {/* Customer & Business Entry Section */}
      <section className="entry-section">
        <div className="entry-container">
          <div className="entry-card customer">
            <h3>For Customers</h3>
            <p>Find, book, and enjoy services from trusted local professionals in seconds.</p>
            <a href="/explore" className="cta-button primary">Explore Services</a>
          </div>
          <div className="entry-card business">
            <h3>For Businesses</h3>
            <p>Grow your client base, manage bookings, and boost your reputation with ease.</p>
            <a href="/join" className="cta-button secondary">Join as a Provider</a>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="divider-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8faff" d="M0,64L1440,0L1440,320L0,320Z"></path>
        </svg>
      </div>

      {/* Value Proposition */}
      <section className="value-section">
        <div className="value-container">
          <h2>Why Choose BizBooker?</h2>
          <div className="value-grid">
            <div className="value-card">
              <div className="icon-container">
                <Calendar size={40} />
              </div>
              <h3>Effortless Booking</h3>
              <p>Customers book services in seconds with real-time availability.</p>
            </div>

            <div className="value-card">
              <div className="icon-container">
                <Users size={40} />
              </div>
              <h3>Business Growth</h3>
              <p>Service providers attract and retain more clients.</p>
            </div>

            <div className="value-card">
              <div className="icon-container">
                <Shield size={40} />
              </div>
              <h3>Trusted Platform</h3>
              <p>Verified businesses and secure payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section">
        <div className="steps-container">
          <h2>Simple For Everyone</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Discover</h3>
                <p>Find local services or list your business</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Book</h3>
                <p>Instant appointments with confirmation</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Enjoy</h3>
                <p>Seamless service experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-container">
          <h2>Ready to Experience Better Bookings?</h2>
          <p>Join businesses and customers who trust BizBooker</p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-button primary">Sign Up Free</a>
            <a href="/demo" className="cta-button secondary">See How It Works</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
