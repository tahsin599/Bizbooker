package com.tahsin.backend.Controller;

import com.tahsin.backend.dto.BusinessHoursConfigDTO;
import com.tahsin.backend.dto.TimeSlotDTO;
import com.tahsin.backend.Service.BusinessHoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/business-hours")
public class BusinessHoursController {

    @Autowired
    private BusinessHoursService businessHoursService;

    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessHoursConfigDTO> getConfig(@PathVariable Long businessId) {
        return ResponseEntity.ok(businessHoursService.getConfig(businessId));
    }

    @PostMapping
    public ResponseEntity<Void> saveConfig(@RequestBody BusinessHoursConfigDTO configDTO) {
        businessHoursService.saveConfig(configDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/generate-slots/{businessId}")
    public ResponseEntity<List<TimeSlotDTO>> generateSlots(
            @PathVariable Long businessId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(businessHoursService.generateSlots(businessId, date));
    }
}