package com.cinepass.service;

import com.cinepass.dto.SeatUpdateMessage;
import com.cinepass.entity.SeatStatus;
import com.cinepass.event.BookingStatusChangedEvent;
import com.cinepass.event.SeatStatusChangedEvent;
import com.cinepass.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatBroadcastService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SeatRepository seatRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSeatStatusChanged(SeatStatusChangedEvent event) {
        log.info("Broadcasting SeatStatusChangedEvent for seat {} to {}", event.getSeatNumber(), event.getNewStatus());
        broadcast(
                event.getShowId(),
                event.getSeatId(),
                event.getSeatNumber(),
                event.getNewStatus(),
                event.getUserId()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingStatusChanged(BookingStatusChangedEvent event) {
        SeatStatus targetStatus = switch (event.getNewStatus()) {
            case CONFIRMED -> SeatStatus.BOOKED;
            case CANCELLED -> SeatStatus.AVAILABLE;
            default -> null;
        };

        if (targetStatus == null) return;

        log.info("Broadcasting BookingStatusChangedEvent for booking {} setting seats to {}", event.getBookingId(), targetStatus);

        seatRepository.findAllById(event.getSeatIds()).forEach(seat -> {
            broadcast(
                    event.getShowId(),
                    seat.getId(),
                    seat.getSeatNumber(),
                    targetStatus,
                    event.getUserId()
            );
        });
    }

    private void broadcast(Long showId, Long seatId, String seatNumber, SeatStatus status, Long userId) {
        SeatUpdateMessage message = SeatUpdateMessage.builder()
                .showId(showId)
                .seatId(seatId)
                .seatNumber(seatNumber)
                .seatStatus(status)
                .userId(userId)
                .timestamp(Instant.now().toString())
                .build();

        // Publish to Redis instead of STOMP directly
        redisTemplate.convertAndSend("seat-updates", message);
    }
}
