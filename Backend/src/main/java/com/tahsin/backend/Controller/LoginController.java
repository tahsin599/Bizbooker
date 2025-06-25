package com.tahsin.backend.Controller;

import java.io.IOException;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.UserService;

@RestController
public class LoginController {
    @Autowired
    private UserService service;
    @Autowired
    private UserRepository userRepository;
    
    private String generateUniqueUsername(String email) {
    String baseUsername = email.split("@")[0];

    // Optional: sanitize username (remove dots, special chars, etc.)
    baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

    // Check database for existing usernames
    String username = baseUsername;

    return username;

    
}

    @PostMapping("/loging")
    public void login(@RequestPart User user,@RequestPart MultipartFile profilePicture) throws IOException {
        user.setUsername(generateUniqueUsername(user.getEmail()));
        service.register(user,profilePicture);
        

        
       

    }

    @GetMapping("/image")
   public ResponseEntity<byte[]> getUserImage() {
    Optional<User> user = userRepository.findByUsername("ktahsin280");
    if (!user.isPresent()) {
        return ResponseEntity.notFound().build();




    }
    byte[] image = user.get().getImageData();
    if (image == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_JPEG)  // or PNG if you want
        .body(image);
}

}
