package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.register(user);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            User user = userService.login(body.get("email"), body.get("password"));
            String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getName(), user.getId());
            return ResponseEntity.ok(Map.of("user", user, "token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String role) {
        if (role == null || role.isBlank()) {
            return ResponseEntity.ok(userRepository.findAll());
        }

        if ("MEMBER".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(userService.getMembers());
        }

        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/trainer/add-member")
    public ResponseEntity<?> addMemberByTrainer(
        Authentication authentication,
        @RequestBody User member
    ) {
        try {
            User saved = userService.addMemberByTrainer(authentication.getName(), member);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/trainer/remove-member/{memberId}")
    public ResponseEntity<?> removeMemberByTrainer(
        Authentication authentication,
        @PathVariable Long memberId
    ) {
        try {
            userService.removeMemberByTrainer(authentication.getName(), memberId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
