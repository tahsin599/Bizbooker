import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  Calendar, Clock, ChevronRight, ChevronDown, ChevronUp,
  Check, X, Loader, ArrowLeft, Search, Filter, DollarSign,
  MapPin, Star, TrendingUp, Activity, CheckCircle
} from 'lucide-react';
import './BookingsPage.css';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Status options for filtering
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  // Calculate stats from bookings
  useEffect(() => {
    const newStats = bookings.reduce((acc, booking) => {
      acc.total++;
      acc[booking.status.toLowerCase()]++;
      return acc;
    }, { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    
    setStats(newStats);
  }, [bookings]);

  // Fetch bookings with pagination
  const fetchBookings = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/user/${userId}/bookings?page=${reset ? 0 : page}&size=20&sort=startTime,desc${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      console.log('Bookings response:', data); // Debug log
      console.log('Current page:', page, 'Total elements:', data.totalElements, 'Is last page:', data.last);
      
      if (reset) {
        setBookings(data.content);
      } else {
        setBookings(prev => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show all bookings function
  const showAllBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/user/${userId}/bookings?page=0&size=100&sort=startTime,desc${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch all bookings');
      
      const data = await response.json();
      console.log('All bookings response:', data);
      
      setBookings(data.content);
      setHasMore(false); // No more to load since we got all
      setPage(0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchBookings(true);
  }, [statusFilter, searchTerm]);

  // Load more bookings
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchBookings(false);
    }
  }, [page]);

  // Toggle booking details
  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'confirmed';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      case 'COMPLETED':
        return 'completed';
      default:
        return '';
    }
  };

  // Confirm appointment - trigger payment process
  const confirmAppointment = async (booking) => {
    try {
      setLoading(true);
      
      // Create checkout session for payment
      const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price: booking.slotPrice || 0,
          quantity: 1,
          businessId: booking.businessId,
          appointmentId: booking.appointmentId,
          successUrl: `${window.location.origin}/booking-payment-success`,
          cancelUrl: `${window.location.origin}/bookings`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const stripeData = await response.json();
      
      if (stripeData.alreadyPaid === "true") {
        // Payment already completed, just refresh the bookings
        alert('Payment already completed! Appointment has been confirmed.');
        fetchBookings(); // Refresh to show updated status
        return;
      }
      
      if (stripeData.url && stripeData.sessionId) {
        // Store booking data for after payment
        localStorage.setItem('confirmingAppointmentId', booking.appointmentId);
        localStorage.setItem('stripeSessionId', stripeData.sessionId);
        sessionStorage.setItem('confirmingAppointmentId', booking.appointmentId);
        sessionStorage.setItem('stripeSessionId', stripeData.sessionId);
        
        // Store booking data for payment completion
        localStorage.setItem('pendingAppointmentData', JSON.stringify({
          slotPrice: booking.slotPrice,
          businessId: booking.businessId,
          appointmentId: booking.appointmentId
        }));
        
        // Redirect to Stripe Checkout
        window.location.href = stripeData.url;
      } else {
        throw new Error('Invalid payment session response');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to start payment process: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Use dedicated cancellation endpoint that handles slot restoration
      const response = await fetch(`${API_BASE_URL}/api/appointments/${booking.appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      const updatedAppointment = await response.json();
      
      // Remove the cancelled appointment from the local state since it's deleted from database
      setBookings(prevBookings => 
        prevBookings.filter(b => b.appointmentId !== booking.appointmentId)
      );

      alert('Appointment cancelled and removed successfully. Your slot has been made available for other customers.');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Back
          </button>
          <h1>My Bookings</h1>
        </div>

        {/* Statistics Section */}
        {bookings.length > 0 && (
          <div className="bookings-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.confirmed}</div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bookings-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter size={18} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={showAllBookings} 
            className="show-all-button"
            disabled={loading}
          >
            {loading ? <Loader size={16} className="spinner" /> : <TrendingUp size={16} />}
            Show All
          </button>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {loading && bookings.length === 0 ? (
            <div className="loading-container">
              <Loader size={32} className="spinner" />
              <h3>Loading your bookings...</h3>
              <p>Please wait while we fetch your appointment history</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <X size={48} color="#ef4444" />
              <h3>Error loading bookings</h3>
              <p>{error}</p>
              <button className="explore-button" onClick={() => fetchBookings(true)}>
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings">
              <Calendar size={64} color="#667eea" />
              <h3>No bookings found</h3>
              <p>You haven't made any appointments yet. Start exploring businesses and book your first appointment!</p>
              <button 
                className="explore-button"
                onClick={() => navigate('/business/customer')}
              >
                Explore Businesses
              </button>
            </div>
          ) : (
            <>
              {bookings.map(booking => (
                <div 
                  key={booking.appointmentId} 
                  className={`booking-card ${expandedBooking === booking.appointmentId ? 'expanded' : ''}`}
                >
                  <div 
                    className="booking-summary"
                    onClick={() => toggleBookingDetails(booking.appointmentId)}
                  >
                    <div className="booking-info">
                      <div className="booking-business">
                        <h3>{booking.businessName}</h3>
                        {booking.serviceName && (
                          <p className="booking-service">{booking.serviceName}</p>
                        )}
                      </div>
                      <div className="booking-time">
                        <div className="booking-date">
                          <Calendar size={16} />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                        <div className="booking-time-slot">
                          <Clock size={16} />
                          <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                      {expandedBooking === booking.appointmentId ? (
                        <ChevronUp size={20} className="expand-icon" />
                      ) : (
                        <ChevronDown size={20} className="expand-icon" />
                      )}
                    </div>
                  </div>

                  {expandedBooking === booking.appointmentId && (
                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="detail-label">
                          <MapPin size={16} /> Location:
                        </span>
                        <span className="detail-value">{booking.locationAddress || booking.locationName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">#{booking.appointmentId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.slotPrice && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <DollarSign size={16} /> Price:
                          </span>
                          <span className="detail-value detail-price">
                            ${booking.slotPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="booking-actions">
                        {booking.status === 'PENDING' && (
                          <>
                            <button 
                              className="action-button confirm"
                              onClick={() => confirmAppointment(booking)}
                              disabled={loading}
                            >
                              <CheckCircle size={16} /> {loading ? 'Processing...' : 'Confirm & Pay'}
                            </button>
                            <button 
                              className="action-button cancel"
                              onClick={() => cancelAppointment(booking)}
                              disabled={loading}
                            >
                              <X size={16} /> Cancel
                            </button>
                          </>
                        )}
                        <button 
                          className="action-button view"
                          onClick={() => navigate(`/business/customer/${booking.businessId}`)}
                        >
                          <Star size={16} /> View Business
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className="load-more-button"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="spinner" /> Loading...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={16} /> Load More Bookings
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Show All Bookings Button */}
              <div className="show-all-container">
                <button 
                  className="show-all-button"
                  onClick={showAllBookings}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="spinner" /> Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> Show All Bookings
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;