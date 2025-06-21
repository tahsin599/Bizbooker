import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Welcome to BizBooker</h1>
          <p>Empowering service seekers and providers with a seamless digital booking experience.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          To redefine how people discover, connect, and engage with service providers. We strive to offer an intuitive platform that boosts business visibility and ensures customer satisfaction through trust, efficiency, and innovation.
        </p>
      </section>

      {/* Vision Section */}
      <section className="about-vision">
        <h2>Our Vision</h2>
        <p>
          To become the leading platform for service booking by fostering digital transformation, enhancing local economies, and delivering exceptional user experiences through advanced technology.
        </p>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <h2>What We Stand For</h2>
        <div className="value-cards">
          <div className="card">
            <h3>Integrity</h3>
            <p>Transparency, honesty, and reliability in every interaction.</p>
          </div>
          <div className="card">
            <h3>Innovation</h3>
            <p>Continually improving and embracing technology to meet user needs.</p>
          </div>
          <div className="card">
            <h3>Customer Focus</h3>
            <p>Placing our users at the heart of every decision.</p>
          </div>
          <div className="card">
            <h3>Accessibility</h3>
            <p>Creating a platform that is inclusive, easy to use, and available to all.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <h2>Meet the Team</h2>
        <p>
          A passionate group of developers, designers, strategists, and visionaries committed to building a smarter and more connected service booking experience.
        </p>
        <ul className="team-list">
          <li><strong>CEO:</strong> Sarah Thompson</li>
          <li><strong>CTO:</strong> Michael Lee</li>
          <li><strong>Lead Designer:</strong> Amara Patel</li>
          <li><strong>Product Manager:</strong> Diego Fernandez</li>
        </ul>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <h3>50,000+</h3>
            <p>Bookings Completed</p>
          </div>
          <div className="stat-box">
            <h3>20,000+</h3>
            <p>Registered Businesses</p>
          </div>
          <div className="stat-box">
            <h3>98%</h3>
            <p>Customer Satisfaction</p>
          </div>
          <div className="stat-box">
            <h3>120+</h3>
            <p>Service Categories</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Join BizBooker Today</h2>
        <p>
          Whether you're a service provider looking to grow or a customer seeking convenience, BizBooker is your trusted partner.
        </p>
        <a href="/signup" className="cta-button">Get Started</a>
      </section>
    </div>
  );
};

export default AboutUs;