package com.tahsin.backend.Service;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.AppointmentStatus;
import com.tahsin.backend.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public Page<Appointment> getAppointmentsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        return appointmentRepository.findByCustomerIdOrderByStartTimeDesc(userId, pageable);
    }

    public Appointment updateStatus(Long appointmentId, AppointmentStatus status) {
        System.out.println("[SERVICE] Updating appointment ID: " + appointmentId + " to status: " + status);
        Appointment appointment = getById(appointmentId);
        System.out.println("[SERVICE] Found appointment with current status: " + appointment.getStatus());
        appointment.setStatus(status);
        System.out.println("[SERVICE] Set new status to: " + appointment.getStatus());
        Appointment savedAppointment = appointmentRepository.save(appointment);
        System.out.println("[SERVICE] Saved appointment with status: " + savedAppointment.getStatus());
        return savedAppointment;
    }
}


    // Additional service methods would go here...
