package com.tahsin.backend.Service;

import com.tahsin.backend.dto.*;
import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
import java.util.stream.*;

@Service
public class BusinessHoursService {

    @Autowired
    private BusinessHoursRepository businessHoursRepo;

    @Autowired
    private SlotConfigurationRepository slotConfigRepo;

    @Autowired
    private BusinessRepository businessRepo;

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private BusinessLocationRepository locationRepo;

    public BusinessHoursConfigDTO getConfig(Long businessId) {
        Business business = businessRepo.findById(businessId)
            .orElseThrow(() -> new RuntimeException("Business not found"));
        
        BusinessHoursConfigDTO configDTO = new BusinessHoursConfigDTO();
        configDTO.setBusinessId(businessId);
        
        // Get regular hours
        List<BusinessHours> regularHours = businessHoursRepo.findByBusinessId(businessId);
        configDTO.setRegularHours(convertToHoursDTO(regularHours));
        
        // Get slot configuration for primary location
        BusinessLocation primaryLocation = locationRepo.findByBusinessIdAndIsPrimary(businessId, true)
            .orElseThrow(() -> new RuntimeException("Primary location not found"));
        
        SlotConfiguration slotConfig = slotConfigRepo.findByLocationId(primaryLocation.getId());
        configDTO.setSlotConfig(convertToSlotConfigDTO(slotConfig));
        
        return configDTO;
    }

    @Transactional
    public void saveConfig(BusinessHoursConfigDTO configDTO) {
        // Validate business exists
        Business business = businessRepo.findById(configDTO.getBusinessId())
            .orElseThrow(() -> new RuntimeException("Business not found"));
        
        // Get primary location
        BusinessLocation primaryLocation = locationRepo.findByBusinessIdAndIsPrimary(configDTO.getBusinessId(), true)
            .orElseThrow(() -> new RuntimeException("Primary location not found"));
        
        // Save regular hours
        businessHoursRepo.deleteByBusinessId(configDTO.getBusinessId());
        List<BusinessHours> regularHours = convertToBusinessHours(configDTO);
        businessHoursRepo.saveAll(regularHours);
        
        // Save slot configuration
        SlotConfiguration slotConfig = convertToSlotConfig(configDTO, primaryLocation);
        slotConfigRepo.save(slotConfig);
    }

    public List<TimeSlotDTO> generateSlots(Long businessId, LocalDate date) {
        // Get business hours for this day of week
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        BusinessHours hours = businessHoursRepo.findByBusinessIdAndDayOfWeek(businessId, dayOfWeek.getValue())
            .orElseThrow(() -> new RuntimeException("No business hours configured for this day"));
        
        if (hours.getIsClosed()) {
            return Collections.emptyList();
        }

        // Get primary location
        BusinessLocation primaryLocation = locationRepo.findByBusinessIdAndIsPrimary(businessId, true)
            .orElseThrow(() -> new RuntimeException("Primary location not found"));
        
        // Get slot configuration
        SlotConfiguration slotConfig = slotConfigRepo.findByLocationId(primaryLocation.getId());
        if (slotConfig == null) {
            throw new RuntimeException("Slot configuration not found");
        }

        // Reset used slots if it's a new day
        if (slotConfig.getLastResetDate() == null || 
            !slotConfig.getLastResetDate().equals(LocalDate.now())) {
            slotConfig.setUsedSlots(0);
            slotConfig.setLastResetDate(LocalDate.now());
            slotConfigRepo.save(slotConfig);
        }

        // Generate time slots between configured start and end times
        LocalTime start = slotConfig.getStartTime();
        LocalTime end = slotConfig.getEndTime();
        int slotDuration = 30; // Default duration if not specified
        if (slotConfig.getSlotDuration() != null) {
            slotDuration = slotConfig.getSlotDuration();
        }

        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalTime current = start;

        while (current.plusMinutes(slotDuration).isBefore(end) || current.plusMinutes(slotDuration).equals(end)) {
            TimeSlotDTO slot = new TimeSlotDTO();
            slot.setTime(current.toString());
            
            // Check if slot is available (not fully booked)
            int bookedCount = 0;
                
            
            slot.setAvailable(bookedCount < slotConfig.getMaxSlotsPerInterval());
            slot.setRemainingSlots(slotConfig.getMaxSlotsPerInterval() - bookedCount);
            
            slots.add(slot);
            current = current.plusMinutes(slotDuration);
        }

        return slots;
    }

    // Helper methods
    private List<BusinessHoursDTO> convertToHoursDTO(List<BusinessHours> businessHours) {
        return businessHours.stream()
            .map(hour -> {
                BusinessHoursDTO dto = new BusinessHoursDTO();
                dto.setDayOfWeek(hour.getDayOfWeek());
                dto.setOpenTime(hour.getOpenTime().toString());
                dto.setCloseTime(hour.getCloseTime().toString());
                dto.setIsClosed(hour.getIsClosed());
                return dto;
            })
            .collect(Collectors.toList());
    }

    private SlotConfigDTO convertToSlotConfigDTO(SlotConfiguration slotConfig) {
        if (slotConfig == null) {
            SlotConfigDTO defaultConfig = new SlotConfigDTO();
            defaultConfig.setMaxSlotsPerInterval(1);
            defaultConfig.setStartTime("09:00");
            defaultConfig.setEndTime("17:00");
            return defaultConfig;
        }
        
        SlotConfigDTO dto = new SlotConfigDTO();
        dto.setLocationId(slotConfig.getLocation().getId());
        dto.setMaxSlotsPerInterval(slotConfig.getMaxSlotsPerInterval());
        dto.setUsedSlots(slotConfig.getUsedSlots());
        dto.setStartTime(slotConfig.getStartTime().toString());
        dto.setEndTime(slotConfig.getEndTime().toString());
        dto.setLastResetDate(slotConfig.getLastResetDate() != null ? 
            slotConfig.getLastResetDate().toString() : null);
        
        return dto;
    }

    private List<BusinessHours> convertToBusinessHours(BusinessHoursConfigDTO configDTO) {
        return configDTO.getRegularHours().stream()
            .map(hourDTO -> {
                BusinessHours hour = new BusinessHours();
                hour.setBusiness(new Business(configDTO.getBusinessId()));
                hour.setDayOfWeek(hourDTO.getDayOfWeek());
                hour.setOpenTime(LocalTime.parse(hourDTO.getOpenTime()));
                hour.setCloseTime(LocalTime.parse(hourDTO.getCloseTime()));
                hour.setIsClosed(hourDTO.getIsClosed());
                return hour;
            })
            .collect(Collectors.toList());
    }

    private SlotConfiguration convertToSlotConfig(BusinessHoursConfigDTO configDTO, BusinessLocation location) {
        SlotConfigDTO slotConfigDTO = configDTO.getSlotConfig();
        SlotConfiguration slotConfig = slotConfigRepo.findByLocationId(location.getId());
        
        if (slotConfig == null) {
            slotConfig = new SlotConfiguration();
            slotConfig.setLocation(location);
            slotConfig.setUsedSlots(0);
            slotConfig.setLastResetDate(LocalDate.now());
        }
        
        // Update only the fields that should be editable
        if (slotConfigDTO.getMaxSlotsPerInterval() != null) {
            slotConfig.setMaxSlotsPerInterval(slotConfigDTO.getMaxSlotsPerInterval());
        }
        if (slotConfigDTO.getStartTime() != null) {
            slotConfig.setStartTime(LocalTime.parse(slotConfigDTO.getStartTime()));
        }
        if (slotConfigDTO.getEndTime() != null) {
            slotConfig.setEndTime(LocalTime.parse(slotConfigDTO.getEndTime()));
        }
        
        return slotConfig;
    }
    
    @Transactional
    public void incrementUsedSlots(Long locationId) {
        SlotConfiguration config = slotConfigRepo.findByLocationId(locationId);
        if (config != null) {
            config.setUsedSlots(config.getUsedSlots() + 1);
            slotConfigRepo.save(config);
        }
    }
    
    @Transactional
    public void decrementUsedSlots(Long locationId) {
        SlotConfiguration config = slotConfigRepo.findByLocationId(locationId);
        if (config != null && config.getUsedSlots() > 0) {
            config.setUsedSlots(config.getUsedSlots() - 1);
            slotConfigRepo.save(config);
        }
    }
}