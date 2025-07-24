
import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_BASE_URL } from '../config/api';

const PaymentForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (amount === 0) {
      // Free slot, just confirm
      console.log('Free booking - calling onSuccess with free-booking identifier');
      onSuccess('free-booking');
      return;
    }
    
    if (!stripe || !elements) {
      console.log('Stripe not ready yet');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('Creating payment intent for amount:', amount);
      
      // Call backend to create PaymentIntent and get clientSecret
      const response = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create payment intent: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const clientSecret = data.clientSecret;
      console.log('Payment intent created, confirming payment...');

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (result.error) {
        console.error('Payment failed:', result.error);
        alert('Payment failed: ' + result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', result.paymentIntent.id);
        // Pass paymentIntent.id to onSuccess so it can be used as paymentReference
        onSuccess(result.paymentIntent.id);
      } else {
        console.log('Payment status:', result.paymentIntent.status);
        alert('Payment processing... Status: ' + result.paymentIntent.status);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {amount > 0 ? (
        <>
          <CardElement />
          <button type="submit" disabled={!stripe} style={{marginTop:16}}>Pay</button>
        </>
      ) : (
        <button type="submit" style={{marginTop:16}}>Confirm Booking</button>
      )}
    </form>
  );
};

export default PaymentForm;
