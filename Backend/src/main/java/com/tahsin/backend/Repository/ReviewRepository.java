package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Review;
@Repository
@Component
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByAppointment(Appointment appointment);
    
    @Query("SELECT r FROM Review r WHERE r.appointment.business.id = :businessId ORDER BY r.createdAt DESC")
    List<Review> findByBusinessId(@Param("businessId") Long businessId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.appointment.business.id = :businessId")
    Double calculateAverageRating(@Param("businessId") Long businessId);
}
