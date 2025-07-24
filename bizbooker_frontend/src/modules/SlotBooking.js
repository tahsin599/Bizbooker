import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './SlotBooking.css';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import PaymentForm from '../components/PaymentForm';

const SlotBooking = ({ businessId, locationId, onSlotSelect }) => {
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [slotPrice, setSlotPrice] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (businessId && locationId) {
      fetchAvailableSlots();
    }
  }, [businessId, locationId, selectedDate]);

  useEffect(() => {
    if (showPayment) {
      console.log('Stripe payment modal should be visible now.');
    }
  }, [showPayment]);

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

  const handleBookNow = () => {
    if (selectedSlot) {
      setSlotPrice(selectedSlot.price || 0);
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    // Create appointment only after payment is successful
    if (!selectedSlot) return;
    try {
      const appointmentData = {
        customerId: localStorage.getItem('userId'), // Get from auth context/localStorage
        businessId: businessId,
        locationId: locationId,
        startTime: `${selectedDate}T${selectedSlot.time}`,
        endTime: `${selectedDate}T${selectedSlot.endTime || selectedSlot.time}`,
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
        console.log('Appointment registered successfully in DB for user:', appointmentData.customerId);
        navigate('/payment-success');
      } else {
        const error = await response.text();
        alert('Failed to book appointment: ' + error);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  // Remove handleBookAppointment, now handled in handlePaymentSuccess

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
                <button className="book-button" onClick={handleBookNow}>
                  Book Appointment
                  {selectedSlot.price && ` - $${selectedSlot.price}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showPayment && (
        <div className="payment-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 350, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{marginBottom: 24}}>Pay with Card</h2>
            <Elements stripe={stripePromise}>
              <PaymentForm amount={slotPrice} onSuccess={handlePaymentSuccess} />
            </Elements>
            <button onClick={() => setShowPayment(false)} style={{ marginTop: 16, background: '#eee', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotBooking;
