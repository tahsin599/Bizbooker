package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public record AppointmentDto(
    Long id,
    String businessName,
    String serviceName,
    String customerName,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String status,
    String locationAddress
) {}
