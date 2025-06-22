package com.tahsin.backend.Service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.apache.catalina.mapper.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.dto.UserProfileDto;
import com.tahsin.backend.dto.UserRegistrationDto;

@Service
@Component
public class UserService {
    @Autowired
    private  UserRepository userRepository;
    
    private final ModelMapper modelMapper = new ModelMapper();
    
    public String register(User user,MultipartFile profilePicture) throws IOException {
        if(userRepository.existsByEmail(user.getEmail())){
            return "Email already exists";

        }

        user.setImageName(profilePicture.getOriginalFilename());
        user.setImageType(profilePicture.getContentType());
        user.setImageData(profilePicture.getBytes());
            
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return "User registered successfully";


        



    }

    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return modelMapper.map(user, UserProfileDto.class);
    }
    
    public String updateUserProfile(Long userId, UserProfileDto userProfileDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        modelMapper.map(userProfileDto, user);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return "User profile updated successfully";
    }  
    
    public String deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userRepository.delete(user);
        return "User deleted successfully";
    }

    public String changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(newPassword);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return "Password changed successfully";
    }
}