package com.cinepass.service;

import com.cinepass.dto.BookingConfirmRequest;
import com.cinepass.dto.BookingResponse;
import com.cinepass.entity.*;
import com.cinepass.event.BookingStatusChangedEvent;
import com.cinepass.exception.SeatAlreadyBookedException;
import com.cinepass.mapper.BookingMapper;
import com.cinepass.repository.BookingRepository;
import com.cinepass.repository.SeatRepository;
import com.cinepass.repository.ShowRepository;
import com.cinepass.repository.UserRepository;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final ShowRepository showRepository;
    private final SeatService seatService;
    private final BookingMapper bookingMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final RedissonClient redissonClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public BookingResponse confirmBooking(BookingConfirmRequest request) {
        RLock lock = redissonClient.getLock("lock:booking:show:" + request.getShowId());
        try {
            // Wait up to 5 seconds to acquire lock, lease time 10 seconds
            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
                try {
                    return doConfirmBooking(request);
                } finally {
                    if (lock.isHeldByCurrentThread()) {
                        lock.unlock();
                    }
                }
            } else {
                throw new IllegalStateException("System is busy, please try again later");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Booking process interrupted");
        }
    }

    @Transactional
    public BookingResponse doConfirmBooking(BookingConfirmRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new IllegalArgumentException("Show not found"));

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("Invalid seat IDs");
        }

        double totalAmount = 0.0;
        for (Seat seat : seats) {
            if (seat.getSeatStatus() != SeatStatus.LOCKED) {
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is not locked for booking. Current status: " + seat.getSeatStatus());
            }
            // Transition from LOCKED to BOOKED
            seat.setSeatStatus(SeatStatus.BOOKED);
            
            // Cancel the scheduled expiration task from Redis
            redisTemplate.delete("seat_lock:" + show.getId() + ":" + seat.getId());
            
            totalAmount += calculatePrice(show.getBasePrice(), seat.getSeatType());
        }
        
        seatRepository.saveAll(seats);

        Booking booking = Booking.builder()
                .bookingId("BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .show(show)
                .seats(seats)
                .totalAmount(totalAmount)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        eventPublisher.publishEvent(new BookingStatusChangedEvent(
                savedBooking.getBookingId(),
                show.getId(),
                seats.stream().map(Seat::getId).collect(Collectors.toList()),
                BookingStatus.CONFIRMED,
                user.getId()
        ));

        return bookingMapper.toResponse(savedBooking);
    }

    @Transactional
    public void cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);

        // Transition BOOKED -> AVAILABLE
        List<Seat> seats = booking.getSeats();
        for (Seat seat : seats) {
            if (seat.getSeatStatus() == SeatStatus.BOOKED) {
                seat.setSeatStatus(SeatStatus.AVAILABLE);
            }
        }
        seatRepository.saveAll(seats);
        bookingRepository.save(booking);

        eventPublisher.publishEvent(new BookingStatusChangedEvent(
                booking.getBookingId(),
                booking.getShow().getId(),
                seats.stream().map(Seat::getId).collect(Collectors.toList()),
                BookingStatus.CANCELLED,
                booking.getUser().getId()
        ));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(String bookingId) {
        return bookingRepository.findByBookingId(bookingId)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    }

    private double calculatePrice(Double basePrice, SeatType type) {
        return switch (type) {
            case VIP -> basePrice * 2.0;
            case RECLINER -> basePrice * 1.5;
            case PREMIUM -> basePrice * 1.2;
            case REGULAR -> basePrice;
        };
    }
}
