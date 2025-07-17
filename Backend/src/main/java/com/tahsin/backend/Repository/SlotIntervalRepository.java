package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.SlotInterval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface SlotIntervalRepository extends JpaRepository<SlotInterval, Long> {
    List<SlotInterval> findByConfigurationId(Long configId);
    
    @Transactional
    @Modifying
    @Query("UPDATE SlotInterval s SET s.usedSlots = s.usedSlots + 1 WHERE s.id = :intervalId AND s.usedSlots < s.maxSlots")
    int incrementUsedSlots(Long intervalId);
    
    Optional<SlotInterval> findByConfigurationIdAndStartTime(Long configId, LocalTime startTime);

    @Transactional
    @Modifying
    @Query("DELETE FROM SlotInterval s WHERE s.configuration.id = :configId")
    void deleteByConfigurationId(Long configId);

    

    
    List<SlotInterval> findByConfigurationIdOrderByStartTimeAsc(Long configId);
}
