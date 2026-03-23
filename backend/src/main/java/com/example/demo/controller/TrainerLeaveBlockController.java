package com.example.demo.controller;

import com.example.demo.entity.TrainerLeaveBlock;
import com.example.demo.service.TrainerLeaveBlockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trainer/leave-blocks")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainerLeaveBlockController {

    @Autowired
    private TrainerLeaveBlockService trainerLeaveBlockService;

    @PostMapping
    public ResponseEntity<?> addLeaveBlock(@RequestBody Map<String, String> body, Authentication authentication) {
        try {
            String date = body.get("date");
            String reason = body.get("reason");
            TrainerLeaveBlock saved = trainerLeaveBlockService.addLeaveBlock(authentication.getName(), date, reason);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeLeaveBlock(@PathVariable Long id, Authentication authentication) {
        try {
            trainerLeaveBlockService.removeLeaveBlock(authentication.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Leave block removed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TrainerLeaveBlock>> getMyLeaveBlocks(Authentication authentication) {
        return ResponseEntity.ok(trainerLeaveBlockService.getMyLeaveBlocks(authentication.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<TrainerLeaveBlock>> getAllLeaveBlocks() {
        return ResponseEntity.ok(trainerLeaveBlockService.getAllLeaveBlocks());
    }
}
