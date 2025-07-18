package com.tahsin.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tahsin.backend.Model.Review;
import com.tahsin.backend.Repository.ReviewRepository;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public Review save(Review review) {
        return reviewRepository.save(review);
    }
    

}
