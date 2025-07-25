import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import Navbar from './Navbar';
import './StripeConnectDashboard.css';

const StripeConnectDashboard = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAccountStatus();
  }, [businessId]);

  const fetchAccountStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/account-status/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStatus(data);
      } else {
        setError('Failed to fetch account status');
      }
    } catch (error) {
      console.error('Error fetching account status:', error);
      setError('Error fetching account status');
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-account/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // After creating account, we need to create onboarding link
        await createOnboardingLink();
      } else {
        setError('Failed to create Stripe account');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setError('Error starting onboarding');
    } finally {
      setLoading(false);
    }
  };

  const createOnboardingLink = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-onboarding-link/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        setError('Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Error creating onboarding link:', error);
      setError('Error creating onboarding link');
    }
  };

  const openStripeDashboard = async () => {
    try {
      setDashboardLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/dashboard-link/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        setError('Failed to open dashboard');
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      setError('Failed to open dashboard');
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stripe-dashboard">
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading payment settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-dashboard">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Payment Settings</h2>
          <p>Manage your payment account and view earnings</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')} className="btn-clear">
              Dismiss
            </button>
          </div>
        )}

        {!accountStatus?.accountExists ? (
          <div className="no-account-state">
            <div className="icon-container">
              <CreditCard size={64} />
            </div>
            <h3>Set Up Payments</h3>
            <p>
              Set up your payment account to start receiving money from customer bookings.
              We use Stripe to ensure secure and fast transfers to your bank account.
            </p>
            <button onClick={startOnboarding} className="btn-primary">
              Set Up Payment Account
            </button>
          </div>
        ) : !accountStatus.onboardingComplete ? (
          <div className="incomplete-onboarding">
            <div className="status-indicator warning">
              <AlertCircle size={24} />
            </div>
            <h3>Complete Payment Setup</h3>
            <p>Your payment account is created but setup isn't complete.</p>
            
            <div className="status-details">
              <div className="status-item">
                <span className={`status-dot ${accountStatus.chargesEnabled ? 'success' : 'warning'}`}></span>
                <span>Accept Payments: {accountStatus.chargesEnabled ? 'Enabled' : 'Pending'}</span>
              </div>
              <div className="status-item">
                <span className={`status-dot ${accountStatus.payoutsEnabled ? 'success' : 'warning'}`}></span>
                <span>Receive Payouts: {accountStatus.payoutsEnabled ? 'Enabled' : 'Pending'}</span>
              </div>
            </div>

            <button onClick={startOnboarding} className="btn-primary">
              Complete Setup
            </button>
          </div>
        ) : (
          <div className="account-active">
            <div className="status-indicator success">
              <CheckCircle size={24} />
            </div>
            <h3>Payment Account Active</h3>
            <p>Your payment account is fully set up and ready to receive payments.</p>

            <div className="account-info">
              <div className="info-grid">
                <div className="info-item">
                  <h4>Platform Fee</h4>
                  <p className="fee-percentage">{accountStatus.platformFeePercentage || 5}%</p>
                  <small>per transaction</small>
                </div>
                <div className="info-item">
                  <h4>Your Earnings</h4>
                  <p className="earnings-percentage">{100 - (accountStatus.platformFeePercentage || 5)}%</p>
                  <small>per transaction</small>
                </div>
                <div className="info-item">
                  <h4>Payout Schedule</h4>
                  <p>Daily</p>
                  <small>for eligible transactions</small>
                </div>
                <div className="info-item">
                  <h4>Account Status</h4>
                  <p className="status-active">Active</p>
                  <small>charges and payouts enabled</small>
                </div>
              </div>
            </div>

            <div className="dashboard-actions">
              <button 
                onClick={openStripeDashboard} 
                disabled={dashboardLoading}
                className="btn-primary"
              >
                {dashboardLoading ? 'Opening...' : 'View Stripe Dashboard'}
              </button>
              <button 
                onClick={() => navigate(`/business/${businessId}`)}
                className="btn-secondary"
              >
                Back to Business
              </button>
            </div>

            <div className="help-section">
              <h4>Payment Information</h4>
              <ul>
                <li>Payments are processed automatically when customers book appointments</li>
                <li>Funds are transferred to your bank account according to Stripe's payout schedule</li>
                <li>You can view detailed payment history in your Stripe dashboard</li>
                <li>Platform fees are deducted automatically before payouts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeConnectDashboard;