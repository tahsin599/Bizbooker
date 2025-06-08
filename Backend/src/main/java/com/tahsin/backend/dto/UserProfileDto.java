package com.tahsin.backend.dto;

import com.tahsin.backend.Model.Role;

public record UserProfileDto(
    Long id,
    String name,
    String email,
    String bio,
    Role role,
    String imageData
) {}
