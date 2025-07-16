package com.tahsin.backend.Controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Service.BusinessService;
import com.tahsin.backend.dto.BusinessDTO;

@RestController
@RequestMapping("/api/business")
public class BusinessController {

    @Autowired
    private BusinessService businessService;

    @PostMapping("/register")
    public ResponseEntity<?> registerBusiness(
            @RequestParam("userId") Long userId,
            @RequestParam("businessName") String businessName,
            @RequestParam("description") String description,
            @RequestParam("categoryName") String categoryName,
            @RequestParam("image") MultipartFile image,
            @RequestParam("address") String address,
            @RequestParam("area") String area,
            @RequestParam("city") String city,
            @RequestParam("postalCode") String postalCode,
            @RequestParam("contactPhone") String contactPhone,
            @RequestParam("contactEmail") String contactEmail) throws IOException {

        // Check if business name exists
        if (businessService.businessNameExists(businessName)) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Business name already exists")
            );
        }

        // Process registration
        Business business = businessService.registerBusiness(
            userId, businessName, description, categoryName, image,
            address, area, city, postalCode, contactPhone, contactEmail
        );

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "businessId", business.getId()
        ));
    }


    @GetMapping
    public ResponseEntity<?> getUserBusinesses(@RequestParam Long ownerId) {
        List<Business> businesses = businessService.getBusinessesByOwnerIdWithDetails(ownerId);
        
        if (businesses.isEmpty()) {
            return ResponseEntity.ok().body(List.of());
        }

        // Convert to DTOs
        List<BusinessDTO> businessDTOs = businesses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(businessDTOs);
    }

     @GetMapping("/{id}")
    public ResponseEntity<?> getBusinessById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        
       

        try {
            Business business = businessService.getBusinessById(id);
            
            // Check if the requesting user owns this business
            
            

            BusinessDTO dto = convertToDTO(business);
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", "Business not found"));
        }
    }


    public BusinessDTO convertToDTO(Business business) {
        BusinessDTO dto = new BusinessDTO();
        
        // Basic business info
        dto.setId(business.getId());
        dto.setBusinessName(business.getBusinessName());
        dto.setDescription(business.getDescription());
        dto.setApprovalStatus(business.getApprovalStatus());
        dto.setIsApproved(business.getIsApproved());
        dto.setCreatedAt(business.getCreatedAt());
        
        // Image data
        dto.setImageData(business.getImageData());
        dto.setImageType(business.getImageType());
        dto.setImageName(business.getImageName());
        
        // Service category
        if (business.getServiceCategory() != null) {
            dto.setCategoryName(business.getServiceCategory().getName());
        }
        
        // Locations (simplified to avoid circular references)
        if (business.getLocations() != null && !business.getLocations().isEmpty()) {
            dto.setLocations(business.getLocations().stream()
                    .map(location -> new BusinessDTO.LocationDTO(
                            location.getId(),
                            location.getAddress(),
                            location.getArea(),
                            location.getCity(),
                            location.getPostalCode(),
                            location.getContactPhone(),
                            location.getContactEmail(),
                            location.getIsPrimary()
                    ))
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}