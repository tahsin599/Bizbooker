package com.tahsin.backend.dto;

import java.time.LocalDate;

public class SlotConfigDTO {
    private Long locationId;
    private Integer maxSlotsPerInterval;
    private Integer usedSlots;
    private String startTime;
    private String endTime;
    private String lastResetDate;
    
    // Getters and Setters
    public Long getLocationId() {
        return locationId;
    }
    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }
    public Integer getMaxSlotsPerInterval() {
        return maxSlotsPerInterval;
    }
    public void setMaxSlotsPerInterval(Integer maxSlotsPerInterval) {
        this.maxSlotsPerInterval = maxSlotsPerInterval;
    }
    public Integer getUsedSlots() {
        return usedSlots;
    }
    public void setUsedSlots(Integer usedSlots) {
        this.usedSlots = usedSlots;
    }
    public String getStartTime() {
        return startTime;
    }
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    public String getEndTime() {
        return endTime;
    }
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    public String getLastResetDate() {
        return lastResetDate;
    }
    public void setLastResetDate(String lastResetDate) {
        this.lastResetDate = lastResetDate;
    }
}