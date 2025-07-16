package com.tahsin.backend.dto;

public record ReviewDto(
    Long appointmentId,
    int rating,
    String comment
) {}
