package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.AIConversationService;
import com.tahsin.backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class AIConversationController {
    

    private final AIConversationService conversationService;
    private final UserRepository userRepository;

    @Autowired
    public AIConversationController(AIConversationService conversationService, UserRepository userRepository) {
        this.conversationService = conversationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/new")
    public ResponseEntity<Long> createNewConversation(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        AIConversation newConversation = conversationService.createNewConversation(user);
        return ResponseEntity.ok(newConversation.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIConversation> getConversation(@PathVariable Long id) {
        AIConversation conversation = conversationService.getConversationById(id);
        if (conversation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(conversation);
    }
}