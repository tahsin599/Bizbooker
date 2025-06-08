package com.tahsin.backend.dto;

import java.time.LocalTime;

public record BusinessHoursDto(
    int dayOfWeek, // 0-6 (Sunday-Saturday)
    LocalTime openTime,
    LocalTime closeTime,
    boolean isClosed
) {}
