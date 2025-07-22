import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './SlotBooking.css';

const SlotBooking = ({ businessId, locationId, onSlotSelect }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (businessId && locationId) {
      fetchAvailableSlots();
    }
  }, [businessId, locationId, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/business-hours/generate-slots/${businessId}?date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch slots');
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) return;

    try {
      const appointmentData = {
        customerId: 1, // TODO: Get from auth context
        businessId: businessId,
        locationId: locationId,
        startTime: `${selectedDate}T${selectedSlot.time}`,
        endTime: `${selectedDate}T${selectedSlot.endTime || selectedSlot.time}`, // Use endTime if available
        configId: selectedSlot.configId,
        userSelectedCount: 1,
        slotPrice: selectedSlot.price,
        notes: ""
      };

      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        alert('Appointment booked successfully!');
        // Refresh available slots
        fetchAvailableSlots();
        setSelectedSlot(null);
      } else {
        const error = await response.text();
        alert('Failed to book appointment: ' + error);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="slot-booking">
      <div className="booking-header">
        <h3>Select Appointment Time</h3>
        <div className="date-selector">
          <Calendar size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading available slots...</p>
        </div>
      ) : (
        <div className="slots-container">
          {availableSlots.length === 0 ? (
            <div className="no-slots">
              <Clock size={32} />
              <p>No available slots for this date</p>
            </div>
          ) : (
            <div className="slots-grid">
              {availableSlots
                .filter(slot => slot.available)
                .map((slot, index) => (
                  <div
                    key={index}
                    className={`time-slot ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="slot-time">
                      <Clock size={16} />
                      {formatTime(slot.time)}
                    </div>
                    {slot.price && (
                      <div className="slot-price">
                        <DollarSign size={14} />
                        {slot.price}
                      </div>
                    )}
                    <div className="slot-availability">
                      {slot.availableSlots || 1} slots available
                    </div>
                  </div>
                ))}
            </div>
          )}

          {selectedSlot && (
            <div className="selected-slot-info">
              <h4>Selected Appointment</h4>
              <div className="appointment-details">
                <div className="detail-row">
                  <Clock size={18} />
                  <span>Time: {formatTime(selectedSlot.time)}</span>
                </div>
                <div className="detail-row">
                  <Calendar size={18} />
                  <span>Date: {new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                {selectedSlot.price && (
                  <div className="detail-row price-row">
                    <DollarSign size={18} />
                    <span>Price: ${selectedSlot.price}</span>
                  </div>
                )}
              </div>
              <div className="booking-actions">
                <button className="book-button" onClick={handleBookAppointment}>
                  Book Appointment
                  {selectedSlot.price && ` - $${selectedSlot.price}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotBooking;
