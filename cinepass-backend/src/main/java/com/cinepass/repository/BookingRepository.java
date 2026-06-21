package com.cinepass.repository;

import com.cinepass.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingId(String bookingId);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
