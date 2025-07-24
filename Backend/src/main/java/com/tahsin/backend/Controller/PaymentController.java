package com.tahsin.backend.Controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Payment;
import com.tahsin.backend.dto.PaymentDto;

import javax.annotation.PostConstruct;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private com.tahsin.backend.Service.PaymentService paymentService;
    @Autowired
    private com.tahsin.backend.Repository.AppointmentRepository appointmentRepository;

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody com.tahsin.backend.dto.PaymentDto dto) {
        try {
            System.out.println("[PAYMENT] Creating payment: " + dto);
            
            // First check if payment already exists for this appointment
            Payment existingPayment = paymentService.getByAppointmentId(dto.appointmentId);
            if (existingPayment != null) {
                System.out.println("[PAYMENT] Payment already exists for appointment " + dto.appointmentId + ": " + existingPayment);
                return ResponseEntity.ok(existingPayment);
            }
            
            Appointment appointment = appointmentRepository.findById(dto.appointmentId).orElse(null);
            if (appointment == null) {
                return ResponseEntity.status(404).body("Appointment not found for ID: " + dto.appointmentId);
            }
            Payment payment = new Payment();
            payment.setAppointment(appointment);
            payment.setAmount(dto.amount);
            payment.setAmountPaid(dto.amountPaid != null ? dto.amountPaid : dto.amount);
            payment.setPaymentMethod(dto.paymentMethod);
            payment.setTransactionId(dto.transactionId);
            payment.setStatus(dto.status != null ? com.tahsin.backend.Model.PaymentStatus.valueOf(dto.status) : com.tahsin.backend.Model.PaymentStatus.PENDING);
            payment.setReceiptUrl(dto.receiptUrl);
            payment.setStripePaymentIntentId(dto.stripePaymentIntentId);
            Payment saved = paymentService.save(payment);
            System.out.println("[PAYMENT] Payment created: " + saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("[PAYMENT EXCEPTION] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating payment: " + e.getMessage());
        }
    }

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @PostMapping("/create-payment-intent")
    public Map<String, String> createPaymentIntent(@RequestBody Map<String, Object> data) {
        try {
            Number amount = (Number) data.get("amount");
            String currency = (String) data.getOrDefault("currency", "usd");
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount.longValue() * 100) // Stripe expects amount in cents
                    .setCurrency(currency)
                    .build();
            PaymentIntent intent = PaymentIntent.create(params);
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            return response;
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody Map<String, Object> data) {
        Stripe.apiKey = "***REMOVED***";
        try {
            Long price = ((Number) data.get("price")).longValue();
            Long quantity = ((Number) data.get("quantity")).longValue();
            String successUrl = "http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}"; // Stripe will replace {CHECKOUT_SESSION_ID}
            String cancelUrl = "http://localhost:3000/payment-cancel";   // Change to your frontend cancel URL

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(quantity)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(price * 100) // Stripe expects cents
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Bizbooker Appointment")
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

            Session session = Session.create(params);
            Map<String, String> response = new HashMap<>();
            response.put("url", session.getUrl());
            response.put("sessionId", session.getId());
            return response;
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointmentId(@PathVariable Long appointmentId) {
        try {
            System.out.println("[PAYMENT] Checking payment for appointment ID: " + appointmentId);
            Payment payment = paymentService.getByAppointmentId(appointmentId);
            if (payment != null) {
                System.out.println("[PAYMENT] Payment found: " + payment.getId() + " for appointment: " + payment.getAppointment().getId());
                return ResponseEntity.ok(payment);
            } else {
                System.out.println("[PAYMENT] No payment found for appointment ID: " + appointmentId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("[PAYMENT EXCEPTION] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error checking payment: " + e.getMessage());
        }
    }
}
