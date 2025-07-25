package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Payment;
import com.tahsin.backend.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    public Payment save(Payment payment) {
        // Check if payment already exists for this appointment
        Payment existingPayment = paymentRepository.findByAppointmentId(payment.getAppointment().getId()).orElse(null);
        if (existingPayment != null) {
            System.out.println("[PAYMENT SERVICE] Payment already exists for appointment " + payment.getAppointment().getId() + ", returning existing payment");
            return existingPayment;
        }
        
        return paymentRepository.save(payment);
    }

    public Payment getByAppointmentId(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId).orElse(null);
    }
}
