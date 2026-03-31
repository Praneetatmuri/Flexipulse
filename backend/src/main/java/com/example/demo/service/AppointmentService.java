package com.example.demo.service;

import com.example.demo.entity.Appointment;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.TrainerLeaveBlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TrainerLeaveBlockRepository trainerLeaveBlockRepository;

    public Appointment bookAppointment(Appointment appointment) {

        boolean trainerBlocked = trainerLeaveBlockRepository.existsByTrainerNameAndDate(
            appointment.getTrainerName(),
            appointment.getDate()
        );

        if (trainerBlocked) {
            throw new RuntimeException(
                "Trainer " + appointment.getTrainerName() + " is on leave on " + appointment.getDate()
            );
        }

        // Check for existing booking with same trainer + date + slot
        boolean alreadyBooked = appointmentRepository
            .existsByTrainerNameAndDateAndSlotTime(
                appointment.getTrainerName(),
                appointment.getDate(),
                appointment.getSlotTime()
            );

        if (alreadyBooked) {
            throw new RuntimeException(
                "Slot Already Taken! " + appointment.getTrainerName() +
                " is already booked at " + appointment.getSlotTime() +
                " on " + appointment.getDate()
            );
        }

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
