package com.tahsin.backend.Service;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.SlotConfiguration;
import com.tahsin.backend.dto.SlotConfigDTO;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.SlotConfigRepository;
import jakarta.transaction.Transactional;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SlotConfigService {

    @Autowired
    private SlotConfigRepository slotConfigRepository;
    
    @Autowired
    private BusinessLocationRepository locationRepository;

    @Autowired
    private SlotIntervalService slotIntervalService;

    @Transactional
    public SlotConfiguration saveOrUpdateSlotConfig(SlotConfigDTO configDTO) {
        BusinessLocation location = locationRepository.findById(configDTO.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));
        
        SlotConfiguration config = slotConfigRepository.findByLocationId(configDTO.getLocationId())
                .orElse(new SlotConfiguration());
        
        config.setLocation(location);
        config.setStartTime(configDTO.getStartTime());
        config.setEndTime(configDTO.getEndTime());
        config.setSlotDuration(configDTO.getSlotDuration());
        config.setMaxSlotsPerInterval(configDTO.getMaxSlotsPerInterval());
        
        SlotConfiguration savedConfig = slotConfigRepository.save(config);
        
        // Initialize/Reinitialize slots
        slotIntervalService.initializeSlots(savedConfig);
        
        return savedConfig;
    }

    public SlotConfiguration getByLocationId(Long locationId) {
        return slotConfigRepository.findByLocationId(locationId)
                .orElseThrow(() -> new RuntimeException("Slot config not found for location"));
    }

    @Transactional
    public void resetUsedSlots(Long locationId) {
        SlotConfiguration config = getByLocationId(locationId);
        config.setUsedSlots(0);
        config.setLastResetDate(LocalDate.now());
        slotConfigRepository.save(config);
    }

}
