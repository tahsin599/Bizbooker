package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessHours;

@Repository
@Component
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {
    List<BusinessHours> findByBusiness(Business business);
    
    @Query("SELECT bh FROM BusinessHours bh WHERE bh.business.id = :businessId AND bh.dayOfWeek = :day")
    Optional<BusinessHours> findByBusinessAndDay(
        @Param("businessId") Long businessId,
        @Param("day") Integer day);
    
}



