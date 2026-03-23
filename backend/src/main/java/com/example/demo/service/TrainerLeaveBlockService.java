package com.example.demo.service;

import com.example.demo.entity.TrainerLeaveBlock;
import com.example.demo.entity.User;
import com.example.demo.repository.TrainerLeaveBlockRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainerLeaveBlockService {

    @Autowired
    private TrainerLeaveBlockRepository trainerLeaveBlockRepository;

    @Autowired
    private UserRepository userRepository;

    public TrainerLeaveBlock addLeaveBlock(String trainerEmail, String date, String reason) {
        User trainer = userRepository.findByEmail(trainerEmail)
            .orElseThrow(() -> new RuntimeException("Trainer account not found."));

        if (trainer.getRole() == null || !"TRAINER".equalsIgnoreCase(trainer.getRole())) {
            throw new RuntimeException("Only trainers can add leave blocks.");
        }

        if (trainerLeaveBlockRepository.existsByTrainerNameAndDate(trainer.getName(), date)) {
            throw new RuntimeException("Leave block already exists for this date.");
        }

        TrainerLeaveBlock block = new TrainerLeaveBlock();
        block.setTrainerEmail(trainerEmail);
        block.setTrainerName(trainer.getName());
        block.setDate(date);
        block.setReason(reason == null ? "Unavailable" : reason);

        return trainerLeaveBlockRepository.save(block);
    }

    public void removeLeaveBlock(String trainerEmail, Long id) {
        TrainerLeaveBlock block = trainerLeaveBlockRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave block not found."));

        if (!trainerEmail.equalsIgnoreCase(block.getTrainerEmail())) {
            throw new RuntimeException("You can only remove your own leave blocks.");
        }

        trainerLeaveBlockRepository.deleteById(id);
    }

    public List<TrainerLeaveBlock> getMyLeaveBlocks(String trainerEmail) {
        return trainerLeaveBlockRepository.findByTrainerEmail(trainerEmail);
    }

    public List<TrainerLeaveBlock> getAllLeaveBlocks() {
        return trainerLeaveBlockRepository.findAll();
    }
}
