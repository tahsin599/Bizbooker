package com.tahsin.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Service.BusinessService;

@RestController
public class BusinessController {

    @Autowired
    private BusinessService businessService;
    @PostMapping("/register")
    public ResponseEntity<String> registerBusiness(@RequestBody Business business) {
        String response = businessService.registerBusiness(business);
        return ResponseEntity.ok(response);
    }

    

}
