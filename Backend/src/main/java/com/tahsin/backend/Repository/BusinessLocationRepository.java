package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;

@Repository
@Component
public interface BusinessLocationRepository extends JpaRepository<BusinessLocation, Long> {
    List<BusinessLocation> findByBusiness(Business business);
    Optional<BusinessLocation> findByBusinessAndIsPrimary(Business business, boolean isPrimary);
    
    @Query("SELECT bl FROM BusinessLocation bl WHERE bl.area = :area")
    List<BusinessLocation> findByArea(@Param("area") String area);
}
