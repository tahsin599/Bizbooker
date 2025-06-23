import React, { useState } from 'react';
import './DashBoard.css';
import Navbar from './Navbar';
import ScheduleList from './List';
import { Calendar, Users, Home, MessageSquare, CreditCard, Settings, Plus, FileText, User, Shield, Search, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample schedule data - replace with your actual data
  const schedules = [
    {
      id: 1,
      time: '10:00 AM',
      name: 'Doctor Appointment',
      date: '2024-01-15'
    },
    {
      id: 2,
      time: '2:30 PM', 
      name: 'Hair Salon',
      date: '2024-01-16'
    },
    {
      id: 3,
      time: '11:00 AM',
      name: 'Restaurant Booking',
      date: '2024-01-17'
    }
  ];

  const services = [
    { name: 'Profile', icon: <User size={20} />, color: '#4361ee' },
    { name: 'Security', icon: <Shield size={20} />, color: '#4895ef' },
    { name: 'Support', icon: <Shield size={20} />, color: '#3b56d4' },
    { name: 'Medical', icon: <Shield size={20} />, color: '#4361ee' },
    { name: 'Home', icon: <Home size={20} />, color: '#4895ef' },
    { name: 'Chat', icon: <MessageSquare size={20} />, color: '#3a0ca3' },
    { name: 'Bookings', icon: <Calendar size={20} />, color: '#4361ee' },
    { name: 'Payment', icon: <CreditCard size={20} />, color: '#3b56d4' },
    { name: 'Settings', icon: <Settings size={20} />, color: '#4895ef' }
  ];

  const handleCreateBusiness = () => {
    window.location.href = '/create-business';
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1>Welcome back! <span className="wave">👋</span></h1>
                <p>Ready to manage your bookings and schedule today?</p>
              </div>
              <div className="welcome-stats">
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Today's Bookings</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">248</div>
                  <div className="stat-label">Total This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search bookings, services, or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#4361ee'}}>
                <Plus size={24} />
              </div>
              <span>New Booking</span>
            </div>
            <div className="quick-action-card" onClick={handleCreateBusiness}>
              <div className="action-icon" style={{backgroundColor: '#8b5cf6'}}>
                <Home size={24} />
              </div>
              <span>Create Your Business Profile</span>
            </div>
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#10b981'}}>
                <Users size={24} />
              </div>
              <span>Manage Clients</span>
            </div>
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#f59e0b'}}>
                <FileText size={24} />
              </div>
              <span>View Reports</span>
            </div>
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#ef4444'}}>
                <Settings size={24} />
              </div>
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-section">
          <h3>Popular Services</h3>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon" style={{backgroundColor: service.color}}>
                  {service.icon}
                </div>
                <span className="service-name">{service.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="schedule-section">
          <div className="section-header">
            <h3>Your Schedule</h3>
            <button className="view-all-btn">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <ScheduleList schedules={schedules} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;