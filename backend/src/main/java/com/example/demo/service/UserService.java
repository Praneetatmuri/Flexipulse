package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        String normalizedRole = normalizeRole(user.getRole());
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered: " + user.getEmail());
        }
        user.setRole(normalizedRole);
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with email: " + email);
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Incorrect password.");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("MEMBER");
        }

        return user;
    }

    public List<User> getMembers() {
        List<User> allUsers = userRepository.findAll();
        List<User> members = new ArrayList<>();

        for (User user : allUsers) {
            String role = user.getRole();
            if (role == null || role.isBlank() || "MEMBER".equalsIgnoreCase(role)) {
                if (role == null || role.isBlank()) {
                    user.setRole("MEMBER");
                    userRepository.save(user);
                }
                members.add(user);
            }
        }

        return members;
    }

    public User addMemberByTrainer(String trainerEmail, User member) {
        User trainer = findTrainerByEmail(trainerEmail);
        if (trainer == null) {
            throw new RuntimeException("Only trainers can add members.");
        }

        if (member.getEmail() == null || member.getEmail().isBlank()) {
            throw new RuntimeException("Member email is required.");
        }

        if (member.getPassword() == null || member.getPassword().isBlank()) {
            throw new RuntimeException("Member password is required.");
        }

        if (userRepository.existsByEmail(member.getEmail())) {
            throw new RuntimeException("Email already registered: " + member.getEmail());
        }

        member.setRole("MEMBER");
        return userRepository.save(member);
    }

    public void removeMemberByTrainer(String trainerEmail, Long memberId) {
        User trainer = findTrainerByEmail(trainerEmail);
        if (trainer == null) {
            throw new RuntimeException("Only trainers can remove members.");
        }

        User member = userRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found."));

        if (member.getRole() != null && "TRAINER".equalsIgnoreCase(member.getRole())) {
            throw new RuntimeException("Trainer account cannot be removed from member panel.");
        }

        userRepository.deleteById(memberId);
    }

    private User findTrainerByEmail(String trainerEmail) {
        if (trainerEmail == null || trainerEmail.isBlank()) {
            return null;
        }

        Optional<User> trainerOpt = userRepository.findByEmail(trainerEmail);
        if (trainerOpt.isEmpty()) {
            return null;
        }

        User trainer = trainerOpt.get();
        if (trainer.getRole() == null || !"TRAINER".equalsIgnoreCase(trainer.getRole())) {
            return null;
        }

        return trainer;
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "MEMBER";
        }

        if ("TRAINER".equalsIgnoreCase(role)) {
            return "TRAINER";
        }

        return "MEMBER";
    }
}
