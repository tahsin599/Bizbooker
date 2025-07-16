package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.SlotConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SlotConfigurationRepository extends JpaRepository<SlotConfiguration, Long> {
    SlotConfiguration findByLocationId(Long locationId);
}