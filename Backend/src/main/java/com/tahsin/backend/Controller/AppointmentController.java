package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.SlotIntervalRepository;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.*;
import com.tahsin.backend.dto.AppointmentDto;
import com.tahsin.backend.dto.AppointmentResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userService;

    @Autowired
    private BusinessRepository businessService;

    @Autowired
    private BusinessLocationRepository locationService;

    @Autowired
    private SlotIntervalRepository repo;

    

    

    @Autowired
    private com.tahsin.backend.Repository.PaymentRepository paymentRepository;

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentDto appointmentDTO) {
        try {
            // Validate required fields
            if (appointmentDTO.getCustomerId() == null ||
                appointmentDTO.getBusinessId() == null ||
                appointmentDTO.getLocationId() == null ||
                appointmentDTO.getStartTime() == null ||
                appointmentDTO.getEndTime() == null ||
                appointmentDTO.getPaymentReference() == null) {
                return ResponseEntity.badRequest().build();
            }



            // Check for duplicate payment using Payment table
            com.tahsin.backend.Model.Payment payment = paymentRepository.findByTransactionId(appointmentDTO.getPaymentReference())
                .orElse(paymentRepository.findByStripePaymentIntentId(appointmentDTO.getPaymentReference()).orElse(null));
            if (payment != null && payment.getAppointment() != null) {
                System.out.println("[APPOINTMENT] Duplicate paymentReference, not inserting: " + payment.getAppointment());
                return ResponseEntity.ok(payment.getAppointment());
            }

            // Fetch related entities
            User customer = userService.findById(appointmentDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
            Business business = businessService.findById(appointmentDTO.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
            BusinessLocation location = locationService.findById(appointmentDTO.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

            // Get slot price from the slot interval
            Double slotPrice = 0.0;
            if (appointmentDTO.getConfigId() != null) {
                slotPrice = repo.findByConfigurationIdAndStartTime(
                        appointmentDTO.getConfigId(),
                        appointmentDTO.getStartTime().toLocalTime())
                    .map(interval -> interval.getPrice())
                    .orElse(0.0);
            }

            // Create new appointment
            Appointment appointment = new Appointment();
            appointment.setCustomer(customer);
            appointment.setBusiness(business);
            appointment.setLocation(location);
            appointment.setStartTime(appointmentDTO.getStartTime());
            appointment.setEndTime(appointmentDTO.getEndTime());
            appointment.setStatus(AppointmentStatus.PENDING);
            appointment.setSlotPrice(slotPrice); // Store the slot price in the appointment

            repo.findByConfigurationIdAndStartTime(
                    appointmentDTO.getConfigId(),
                    appointmentDTO.getStartTime().toLocalTime())
                .ifPresent(interval -> {
                    // Check if slot is available
                    if (interval.getUsedSlots() + appointmentDTO.getUserSelectedCount() > interval.getMaxSlots()) {
                        throw new RuntimeException("Slot is fully booked");
                    }
                    interval.setUsedSlots(interval.getUsedSlots() + appointmentDTO.getUserSelectedCount());
                    repo.save(interval);
                });

            // Set optional service if provided
           
            // Set optional notes if provided
            if (appointmentDTO.getNotes() != null) {
                appointment.setNotes(appointmentDTO.getNotes());
            }

            // Save the appointment
            Appointment savedAppointment = appointmentService.save(appointment);

            // Create and link payment record if not exists
            if (payment == null) {
                payment = new com.tahsin.backend.Model.Payment();
                payment.setAppointment(savedAppointment);
                payment.setAmountPaid(java.math.BigDecimal.valueOf(slotPrice));
                payment.setAmount(java.math.BigDecimal.valueOf(slotPrice));
                payment.setPaymentMethod("stripe");
                payment.setStatus(com.tahsin.backend.Model.PaymentStatus.COMPLETED);
                payment.setTransactionId(appointmentDTO.getPaymentReference());
                payment.setStripePaymentIntentId(appointmentDTO.getPaymentReference());
                paymentRepository.save(payment);
            } else if (payment.getAppointment() == null) {
                payment.setAppointment(savedAppointment);
                paymentRepository.save(payment);
            }

            System.out.println("[APPOINTMENT] Registered: " + savedAppointment);

            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}")
public ResponseEntity<Page<AppointmentResponseDTO>> getUserAppointments(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size) {
    
    Page<Appointment> appointments = appointmentService.getAppointmentsByUser(userId, page, size);
    
    // Convert Page<Appointment> to Page<AppointmentResponseDTO>
    Page<AppointmentResponseDTO> responseDTOs = appointments.map(appointment -> {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setAppointmentId(appointment.getId());
        dto.setStatus(appointment.getStatus().toString());
        
        // Safely handle nested entities that might be null
        dto.setLocationName(appointment.getLocation() != null ? appointment.getLocation().getArea() : null);
        dto.setBusinessName(appointment.getBusiness() != null ? appointment.getBusiness().getBusinessName() : null);
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        
        // Add any additional fields you want to include
        if (appointment.getService() != null) {
            dto.setServiceName(appointment.getService().getName());
        }
        if (appointment.getCustomer() != null) {
            dto.setCustomerName(appointment.getCustomer().getName());
        }
        
        // Set the slot price from the appointment
        dto.setSlotPrice(appointment.getSlotPrice());
        
        return dto;
    });
    
    return ResponseEntity.ok(responseDTOs);
}


}
