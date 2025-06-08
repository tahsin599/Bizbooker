package com.tahsin.backend.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.User;


@Repository
@Component
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomer(User customer);
    List<Appointment> findByBusiness(Business business);
    List<Appointment> findByLocation(BusinessLocation location);
    
    @Query("SELECT a FROM Appointment a WHERE " +
           "a.location.id = :locationId AND " +
           "((a.startTime < :end AND a.endTime > :start))")
    List<Appointment> findConflictingAppointments(
        @Param("locationId") Long locationId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.business.id = :businessId AND a.status = 'COMPLETED'")
    List<Appointment> findCompletedAppointmentsByBusiness(@Param("businessId") Long businessId);
}
