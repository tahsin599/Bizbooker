import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './StripeOnboarding.css';

const StripeOnboarding = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    checkAccountStatus();
  }, [businessId]);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/account-status/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check account status');
      }

      const data = await response.json();
      setAccountStatus(data);
    } catch (error) {
      console.error('Error checking account status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createStripeAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-account/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Refresh account status
      await checkAccountStatus();
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);

      // If no Stripe account exists, create one first
      if (!accountStatus?.hasStripeAccount) {
        await createStripeAccount();
      }

      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-onboarding-link/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      
      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAccountStatus = () => {
    if (!accountStatus) return null;

    if (!accountStatus.hasStripeAccount) {
      return (
        <div className="stripe-status">
          <div className="status-card">
            <h3>Payment Setup Required</h3>
            <p>To receive payments from customers, you need to set up a Stripe account.</p>
            <ul>
              <li>✓ Secure payment processing</li>
              <li>✓ Direct deposits to your bank account</li>
              <li>✓ Real-time payment tracking</li>
              <li>✓ Automatic tax reporting</li>
            </ul>
            <button 
              className="setup-button"
              onClick={startOnboarding}
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Set Up Payments'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="stripe-status">
        <div className="status-card">
          <h3>Payment Account Status</h3>
          <div className="status-items">
            <div className={`status-item ${accountStatus.onboardingCompleted ? 'completed' : 'pending'}`}>
              <span className="status-icon">
                {accountStatus.onboardingCompleted ? '✅' : '🔄'}
              </span>
              <span>Account Setup: {accountStatus.onboardingCompleted ? 'Complete' : 'Pending'}</span>
            </div>
            
            <div className={`status-item ${accountStatus.chargesEnabled ? 'completed' : 'pending'}`}>
              <span className="status-icon">
                {accountStatus.chargesEnabled ? '✅' : '🔄'}
              </span>
              <span>Receiving Payments: {accountStatus.chargesEnabled ? 'Enabled' : 'Pending'}</span>
            </div>
            
            <div className={`status-item ${accountStatus.payoutsEnabled ? 'completed' : 'pending'}`}>
              <span className="status-icon">
                {accountStatus.payoutsEnabled ? '✅' : '🔄'}
              </span>
              <span>Bank Transfers: {accountStatus.payoutsEnabled ? 'Enabled' : 'Pending'}</span>
            </div>
          </div>

          {!accountStatus.onboardingCompleted && (
            <div className="action-section">
              <p>Complete your account setup to start receiving payments.</p>
              <button 
                className="continue-button"
                onClick={startOnboarding}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Continue Setup'}
              </button>
            </div>
          )}

          {accountStatus.onboardingCompleted && accountStatus.chargesEnabled && (
            <div className="success-section">
              <p>🎉 Your payment account is fully set up! You can now receive payments from customers.</p>
              <button 
                className="dashboard-button"
                onClick={() => navigate(`/business-config/${businessId}`)}
              >
                Back to Business Settings
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !accountStatus) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payment setup...</p>
      </div>
    );
  }

  return (
    <div className="stripe-onboarding-container">
      <div className="stripe-onboarding-content">
        <h1>Payment Setup</h1>
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {renderAccountStatus()}
      </div>
    </div>
  );
};

export default StripeOnboarding;
