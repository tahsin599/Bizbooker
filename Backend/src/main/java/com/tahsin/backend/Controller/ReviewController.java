package com.tahsin.backend.Controller;
import com.tahsin.backend.dto.ReviewRequestDTO;
import com.tahsin.backend.dto.ReviewResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.Review;
import com.tahsin.backend.Service.AppointmentService;
import com.tahsin.backend.Service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    // Add methods to handle review requests
    // For example, a method to create a new review
    @Autowired 
    private ReviewService reviewService;
    @Autowired
    private AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<String> createReview(@RequestBody ReviewRequestDTO reviewRequest) {
        // Logic to create a review based on the request
        Review newReview = new Review();
        newReview.setAppointment(appointmentService.getById(reviewRequest.getAppointmentId()));
        newReview.setRating(reviewRequest.getRating());
        newReview.setComment(reviewRequest.getComment());
        
        reviewService.save(newReview);
        return ResponseEntity.ok("saved");
    }

   

    @GetMapping("/{businessId}")
    public ResponseEntity<Page<ReviewResponseDTO>> getBusinessReviews(
            @PathVariable Long businessId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        
        Page<ReviewResponseDTO> reviews = reviewService.getReviewsByBusiness(businessId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/average/{businessId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long businessId) {
        Double averageRating = reviewService.getAverageRatingByBusiness(businessId);
        return ResponseEntity.ok(averageRating);
    }

}
