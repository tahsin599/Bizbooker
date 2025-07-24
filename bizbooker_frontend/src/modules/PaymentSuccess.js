import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only POST if pendingAppointment exists and not already posted in this session
    const appointmentData = location.state?.appointmentData || JSON.parse(localStorage.getItem("pendingAppointment"));
    const postedFlag = sessionStorage.getItem("appointmentPosted");
    if (appointmentData && !postedFlag) {
      fetch("http://localhost:8081/api/appointments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentData)
      })
      .then(res => res.json())
      .then(data => {
        console.log("Appointment registered:", data);
        console.log("Request body:", JSON.stringify(appointmentData));
        // Remove appointment data so it only posts once
        localStorage.removeItem("pendingAppointment");
        sessionStorage.setItem("appointmentPosted", "true");
      })
      .catch(err => {
        console.error("Failed to register appointment:", err);
      });
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1 style={{ color: "#4BB543" }}>Payment Successful!</h1>
      <p>Your payment was processed successfully.</p>
      <p>Your appointment has been registered as <b>pending</b> in our system.</p>
      <p>You will receive a confirmation once the business approves your booking.</p>
      <button
        style={{ marginTop: "30px", padding: "10px 30px", fontSize: "18px", background: "#4BB543", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}
      >
        OK
      </button>
    </div>
  );
};

export default PaymentSuccess;
