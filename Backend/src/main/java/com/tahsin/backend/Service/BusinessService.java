package com.tahsin.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Repository.BusinessRepository;

@Service
public class BusinessService {

    @Autowired
    public BusinessRepository businessRepository;

    public String registerBusiness(Business business){
        if(businessRepository.existsByBusinessName(business.getBusinessName())){
            return "Business name already exists";


            
        }
        
        businessRepository.save(business);
        return "Business registered successfully";

    }

    





}




    
