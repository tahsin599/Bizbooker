package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.BusinessLocationImage;

@Repository
@Component
public interface BusinessLocationImageRepository extends JpaRepository<BusinessLocationImage, Long> {
    List<BusinessLocationImage> findByLocation(BusinessLocation location);
    
    @Query("SELECT bli FROM BusinessLocationImage bli WHERE bli.location.id = :locationId AND bli.isPrimary = true")
    Optional<BusinessLocationImage> findPrimaryImage(@Param("locationId") Long locationId);
    
    @Modifying
    @Query("UPDATE BusinessLocationImage bli SET bli.isPrimary = false WHERE bli.location.id = :locationId")
    void clearPrimaryImages(@Param("locationId") Long locationId);
}
