package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public record ReviewResponseDto(
    String businessName,
    int rating,
    String customerComment,
    String businessReply,
    LocalDateTime reviewDate
) {}
