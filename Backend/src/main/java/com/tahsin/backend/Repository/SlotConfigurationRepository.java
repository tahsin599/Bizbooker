package com.tahsin.backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.SlotConfiguration;

@Repository
@Component
public interface SlotConfigurationRepository extends JpaRepository<SlotConfiguration, Long> {
    Optional<SlotConfiguration> findByLocation(BusinessLocation location);
    
    @Modifying
    @Query("UPDATE SlotConfiguration sc SET sc.usedSlots = 0 WHERE sc.lastResetDate < CURRENT_DATE")
    void resetDailySlots();
}
