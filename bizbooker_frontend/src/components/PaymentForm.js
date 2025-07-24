
import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount === 0) {
      // Free slot, just confirm
      onSuccess();
      return;
    }
    if (!stripe || !elements) return;

    // Call backend to create PaymentIntent and get clientSecret
    const response = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await response.json();
    const clientSecret = data.clientSecret;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      onSuccess();
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
