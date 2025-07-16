import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Clock as TimeIcon, Check, X, ChevronLeft, ChevronRight, ArrowRight, MapPin,Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './BusinessService.css';

const BusinessService = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const token = localStorage.getItem('token');

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business/${businessId}`,{headers: {
                        'Authorization': `Bearer ${token}`
                    }});
        
        if (!response.ok) throw new Error('Failed to fetch business');
        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  // Helper function to get image URL
  const getImageUrl = (imageData, imageType) => {
    if (!imageData) return null;
    try {
      const base64String = typeof imageData === 'string' 
        ? imageData 
        : arrayBufferToBase64(imageData);
      return `data:${imageType || 'image/jpeg'};base64,${base64String}`;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Sample time slots data - in a real app, this would come from the API
  const availableSlots = {
    '2024-01-15': [
      { time: '09:00', status: 'vacant', customer: null },
      { time: '10:30', status: 'booked', customer: 'John Doe' },
      { time: '14:00', status: 'vacant', customer: null },
      { time: '16:30', status: 'vacant', customer: null }
    ],
    '2024-01-16': [
      { time: '10:00', status: 'vacant', customer: null },
      { time: '11:30', status: 'booked', customer: 'Emma Smith' },
      { time: '15:00', status: 'vacant', customer: null },
      { time: '17:00', status: 'booked', customer: 'Mike Johnson' }
    ]
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days for current selected month/year
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const hasSlots = availableSlots[dateString]?.length > 0;
      const vacantSlots = availableSlots[dateString]?.filter(slot => slot.status === 'vacant').length || 0;
      
      days.push({
        day,
        date: dateString,
        hasSlots,
        vacantSlots
      });
    }
    
    return days;
  };

  const handleDateClick = (dateInfo) => {
    if (dateInfo) {
      setSelectedDate(dateInfo.date);
      setSelectedTime(null);
      
      if (!dateInfo.hasSlots) {
        console.log(`No appointments available for ${dateInfo.date}`);
      }
    }
  };

  const handleTimeClick = (timeSlot) => {
    if (timeSlot.status === 'vacant') {
      setSelectedTime(timeSlot.time);
    }
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedTime) {
      const appointmentData = {
        business: business.businessName,
        date: selectedDate,
        time: selectedTime,
        category: business.categoryName
      };
      console.log('Appointment booked:', appointmentData);
      alert(`Appointment booked for ${selectedDate} at ${selectedTime}`);
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading business details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading business</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="not-found-container">
        <h2>Business not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const imageUrl = getImageUrl(business.imageData, business.imageType);
  const primaryLocation = business.locations?.find(loc => loc.isPrimary) || business.locations?.[0];

  return (
    <div className="business-service-container">
      {/* Header Section */}
      <div className="service-header">
        <div className="service-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt={business.businessName} className="service-image" />
          ) : (
            <div className="image-placeholder">
              <Briefcase size={60} />
            </div>
          )}
          <div className="service-overlay">
            <h1 className="service-title">{business.businessName}</h1>
            <div className="service-category-badge">{business.categoryName}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="business-tabs">
        <button 
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button 
          className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Locations
        </button>
      </div>

      {/* Main Content */}
      <div className="service-content">
        {activeTab === 'services' ? (
          /* Services Tab */
          <div className="service-details-section">
            <div className="service-info-card">
              <div className="service-description">
                <h3>About This Business</h3>
                <p>{business.description}</p>
              </div>

              {/* Booking Section */}
              <div className="booking-card">
                <h3>Book Your Appointment</h3>
                
                {/* Calendar */}
                <div className="calendar-container">
                  <div className="calendar-header">
                    <h4>Select Date</h4>
                    <div className="calendar-navigation">
                      <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft size={20} />
                      </button>
                      <div className="month-year-selector">
                        <span className="month-name">{monthNames[currentMonth]}</span>
                        <span className="year">{currentYear}</span>
                      </div>
                      <button className="nav-btn" onClick={() => navigateMonth('next')}>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="calendar-grid">
                    <div className="calendar-days-header">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="day-header">{day}</div>
                      ))}
                    </div>
                    
                    <div className="calendar-days">
                      {generateCalendarDays().map((dayInfo, index) => (
                        <div
                          key={index}
                          className={`calendar-day ${!dayInfo ? 'empty' : 'clickable'} ${dayInfo?.hasSlots ? 'available' : 'no-slots'} ${selectedDate === dayInfo?.date ? 'selected' : ''}`}
                          onClick={() => handleDateClick(dayInfo)}
                        >
                          {dayInfo?.day}
                          {dayInfo?.hasSlots && (
                            <div className="availability-indicator">
                              <div className="availability-dot"></div>
                              <span className="vacant-count">{dayInfo.vacantSlots}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="time-slots-container">
                    <h4>Schedule for {selectedDate}</h4>
                    <div className="time-slots-detailed">
                      {availableSlots[selectedDate] ? availableSlots[selectedDate].map((timeSlot, index) => (
                        <div
                          key={index}
                          className={`time-slot-detailed ${timeSlot.status} ${selectedTime === timeSlot.time ? 'selected' : ''}`}
                          onClick={() => handleTimeClick(timeSlot)}
                        >
                          <div className="time-slot-time">{timeSlot.time}</div>
                          <div className="time-slot-status">
                            <span className={`status-badge ${timeSlot.status}`}>
                              {timeSlot.status === 'vacant' ? (
                                <>
                                  <Check size={14} /> Available
                                </>
                              ) : (
                                <>
                                  <X size={14} /> Booked
                                </>
                              )}
                            </span>
                            {timeSlot.customer && (
                              <span className="customer-name">by {timeSlot.customer}</span>
                            )}
                          </div>
                          {timeSlot.status === 'vacant' && (
                            <button 
                              className="schedule-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTime(timeSlot.time);
                              }}
                            >
                              Select
                            </button>
                          )}
                        </div>
                      )) : (
                        <div className="no-slots-message">
                          <div className="no-slots-icon">📅</div>
                          <h4>No appointments available</h4>
                          <p>This date has no available time slots. Please select another date.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                {selectedDate && selectedTime && (
                  <div className="booking-confirmation">
                    <div className="selected-appointment">
                      <p><strong>Selected:</strong> {selectedDate} at {selectedTime}</p>
                      {primaryLocation && (
                        <p><strong>Location:</strong> {primaryLocation.address}, {primaryLocation.city}</p>
                      )}
                    </div>
                    <button className="book-appointment-btn" onClick={handleBookAppointment}>
                      Book Appointment <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Locations Tab */
          <div className="locations-section">
            <h3>Our Locations</h3>
            <div className="locations-grid">
              {business.locations?.map((location, index) => (
                <div key={index} className="location-card">
                  <div className="location-header">
                    <h4>
                      <MapPin size={16} /> Location {index + 1}
                      {location.isPrimary && <span className="primary-badge">Primary</span>}
                    </h4>
                  </div>
                  <div className="location-info">
                    <div className="info-row">
                      <span>Address:</span>
                      <p>{location.address}, {location.area}, {location.city}</p>
                    </div>
                    <div className="info-row">
                      <span>Postal Code:</span>
                      <p>{location.postalCode}</p>
                    </div>
                    <div className="info-row">
                      <span>Contact:</span>
                      <p>{location.contactPhone}</p>
                    </div>
                    <div className="info-row">
                      <span>Email:</span>
                      <p>{location.contactEmail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessService;