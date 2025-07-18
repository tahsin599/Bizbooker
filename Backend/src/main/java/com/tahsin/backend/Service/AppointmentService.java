package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    // Additional service methods would go here...
}