package com.tahsin.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.tahsin.backend.Model.Review;
import com.tahsin.backend.Repository.ReviewRepository;
import com.tahsin.backend.dto.ReviewResponseDTO;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review save(Review review) {
        return reviewRepository.save(review);
    }

    public Page<ReviewResponseDTO> getReviewsByBusiness(Long businessId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByBusinessId2(businessId, pageable);
        
        return reviews.map(this::convertToDto);
    }

    private ReviewResponseDTO convertToDto(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        
        // Basic review fields
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setBusinessReply(review.getBusinessReply());
        dto.setReplyDate(review.getReplyDate());
        dto.setCreatedAt(review.getCreatedAt());
        
        // Appointment related fields
        if (review.getAppointment() != null) {
            dto.setAppointmentId(review.getAppointment().getId());
            
            // Customer info
            if (review.getAppointment().getCustomer() != null) {
                dto.setCustomerName(review.getAppointment().getCustomer().getName());
                dto.setImageName(review.getAppointment().getCustomer().getImageName());
                dto.setImageType(review.getAppointment().getCustomer().getImageType()); 
                dto.setImageData(review.getAppointment().getCustomer().getImageData());
                // Add more customer fields if needed
            }
            
            // Service info
            if (review.getAppointment().getService() != null) {
                dto.setServiceName(review.getAppointment().getService().getName());
                // Add more service fields if needed
            }
            
            // Business info
           
        }
        
        return dto;
    }

    // Additional useful methods
    public Double getAverageRatingByBusiness(Long businessId) {
        return reviewRepository.findAverageRatingByBusiness(businessId);
    }

    public Long getReviewCountByBusiness(Long businessId) {
        return reviewRepository.countByBusinessId(businessId);
    }
}