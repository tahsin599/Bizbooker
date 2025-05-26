package com.tahsin.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;

@RestController
public class LoginController {
    @Autowired
    UserRepository repo;
    


    @PostMapping("/loging")
    public void login(){
        User u=new User();
        u.setUsername("ahhsnsn");
        u.setPassword("hdjsmnmx");
        repo.save(u);

    }

}
