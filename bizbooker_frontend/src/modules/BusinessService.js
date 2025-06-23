import React, { useState } from 'react';
import './BusinessService.css';
import { Calendar, Clock, User, Clock as TimeIcon, Check, X, ChevronLeft, ChevronRight, ArrowRight} from 'lucide-react';

const BusinessService = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Sample business service data
  const serviceData = {
    name: "Premium Hair Styling",
    description: "Experience professional hair styling with our expert stylists. We offer cutting-edge techniques and premium products to give you the perfect look you deserve. Our services include cutting, coloring, styling, and treatments for all hair types.",
    category: "Beauty & Wellness",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop",
    owner: {
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b1d0?w=80&h=80&fit=crop&crop=face"
    },
    serviceTime: "60 minutes",
    serviceDate: "Available Monday - Saturday"
  };

  // Enhanced available time slots with booking status
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
    ],
    '2024-01-17': [
      { time: '09:30', status: 'vacant', customer: null },
      { time: '13:00', status: 'vacant', customer: null },
      { time: '15:30', status: 'booked', customer: 'Lisa Brown' }
    ],
    '2024-01-18': [
      { time: '10:00', status: 'vacant', customer: null },
      { time: '12:00', status: 'vacant', customer: null },
      { time: '16:00', status: 'vacant', customer: null }
    ],
    '2024-01-19': [
      { time: '09:00', status: 'booked', customer: 'David Wilson' },
      { time: '11:00', status: 'vacant', customer: null },
      { time: '14:30', status: 'vacant', customer: null },
      { time: '17:30', status: 'vacant', customer: null }
    ],
    '2024-01-20': [
      { time: '10:30', status: 'vacant', customer: null },
      { time: '13:30', status: 'booked', customer: 'Anna Davis' },
      { time: '16:00', status: 'vacant', customer: null }
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
      
      // Show feedback for dates without slots
      if (!dateInfo.hasSlots) {
        // You could add a toast notification here if needed
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
        service: serviceData.name,
        date: selectedDate,
        time: selectedTime,
        owner: serviceData.owner.name,
        category: serviceData.category
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

  const jumpToYear = (year) => {
    setCurrentYear(parseInt(year));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div className="business-service-container">
      {/* Header Section */}
      <div className="service-header">
        <div className="service-image-container">
          <img src={serviceData.image} alt={serviceData.name} className="service-image" />
          <div className="service-overlay">
            <h1 className="service-title">{serviceData.name}</h1>
            <div className="service-category-badge">{serviceData.category}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="service-content">
        {/* Service Details */}
        <div className="service-details-section">
          <div className="service-info-card">
            <div className="owner-info">
              <img src={serviceData.owner.image} alt={serviceData.owner.name} className="owner-avatar" />
              <div className="owner-details">
                <h3>Service Provider</h3>
                <p>{serviceData.owner.name}</p>
              </div>
            </div>
            
            <div className="service-meta">
              <div className="meta-item">
                <div className="meta-icon">
                  <TimeIcon size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{serviceData.serviceTime}</span>
                </div>
              </div>
              <div className="meta-item">
                <div className="meta-icon">
                  <Calendar size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Availability</span>
                  <span className="meta-value">{serviceData.serviceDate}</span>
                </div>
              </div>
            </div>

            <div className="service-description">
              <h3>About This Service</h3>
              <p>{serviceData.description}</p>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="booking-section">
          <div className="booking-card">
            <h3>Book Your Appointment</h3>
            
            {/* Enhanced Calendar with Navigation */}
            <div className="calendar-container">
              <div className="calendar-header">
                <h4>Select Date</h4>
                <div className="calendar-navigation">
                  <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft size={20} />
                  </button>
                  <div className="month-year-selector">
                    <span className="month-name">{monthNames[currentMonth]}</span>
                    <input 
                      type="number" 
                      value={currentYear} 
                      onChange={(e) => jumpToYear(e.target.value)}
                      className="year-input"
                      min="1900"
                      max="9999"
                    />
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

            {/* Enhanced Time Slots with Status */}
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
                </div>
                <button className="book-appointment-btn" onClick={handleBookAppointment}>
                  Book Appointment <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessService;
