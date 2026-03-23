package com.example.demo.repository;

import com.example.demo.entity.TrainerLeaveBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainerLeaveBlockRepository extends JpaRepository<TrainerLeaveBlock, Long> {

    boolean existsByTrainerNameAndDate(String trainerName, String date);

    List<TrainerLeaveBlock> findByTrainerEmail(String trainerEmail);

    List<TrainerLeaveBlock> findByTrainerName(String trainerName);
}
