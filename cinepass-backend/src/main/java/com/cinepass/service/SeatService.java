package com.cinepass.service;

import com.cinepass.dto.SeatDto;
import com.cinepass.entity.Seat;
import com.cinepass.entity.SeatStatus;
import com.cinepass.entity.SeatType;
import com.cinepass.exception.SeatAlreadyBookedException;
import com.cinepass.mapper.SeatMapper;
import com.cinepass.repository.SeatRepository;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinepass.event.SeatStatusChangedEvent;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final SeatMapper seatMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final RedisTemplate<String, Object> redisTemplate;

    public SeatDto[][] getSeatMatrix(Long showId) {
        List<Seat> seats = seatRepository.findByShowId(showId);
        if (seats.isEmpty()) return new SeatDto[0][0];

        // O(1) Lookups internally
        int maxRow = 0;
        int maxCol = 0;
        Map<Integer, Integer> rowMap = new HashMap<>(); // Maps character code to index
        int rowIndex = 0;

        // Sorting by rowLabel then colNumber to ensure consistent mapping
        seats.sort(Comparator.comparing(Seat::getRowLabel).thenComparing(Seat::getColumnNumber));

        for (Seat seat : seats) {
            int rIdx = rowMap.computeIfAbsent(seat.getRowLabel().charAt(0) - 'A', k -> rowMap.size());
            maxRow = Math.max(maxRow, rIdx);
            maxCol = Math.max(maxCol, seat.getColumnNumber());
        }

        SeatDto[][] matrix = new SeatDto[maxRow + 1][maxCol + 1];

        for (Seat seat : seats) {
            int rIdx = rowMap.get(seat.getRowLabel().charAt(0) - 'A');
            // assuming columnNumber is 1-indexed
            int cIdx = seat.getColumnNumber() - 1;
            matrix[rIdx][cIdx] = seatMapper.toDto(seat);
        }

        return matrix;
    }

    public List<SeatDto> recommendSeats(Long showId, int seatCount) {
        List<Seat> allSeats = seatRepository.findByShowId(showId);
        if (allSeats.isEmpty()) return Collections.emptyList();

        Map<String, List<Seat>> seatsByRow = allSeats.stream()
                .collect(Collectors.groupingBy(Seat::getRowLabel, TreeMap::new, Collectors.toList()));

        PriorityQueue<SeatRecommendation> pq = new PriorityQueue<>(Comparator
                .comparingDouble(SeatRecommendation::getScore).reversed());

        int maxCols = allSeats.stream().mapToInt(Seat::getColumnNumber).max().orElse(1);
        double centerCol = maxCols / 2.0;

        // Using Sliding Window within each row to find valid contiguous chunks
        for (Map.Entry<String, List<Seat>> entry : seatsByRow.entrySet()) {
            List<Seat> rowSeats = entry.getValue();
            rowSeats.sort(Comparator.comparingInt(Seat::getColumnNumber));

            for (int i = 0; i <= rowSeats.size() - seatCount; i++) {
                List<Seat> window = new ArrayList<>();
                boolean valid = true;
                double windowScore = 0;

                for (int j = 0; j < seatCount; j++) {
                    Seat s = rowSeats.get(i + j);
                    if (s.getSeatStatus() != SeatStatus.AVAILABLE) {
                        valid = false;
                        break;
                    }
                    // Adjacency check
                    if (j > 0 && (s.getColumnNumber() - rowSeats.get(i + j - 1).getColumnNumber() > 1)) {
                        valid = false;
                        break;
                    }
                    window.add(s);
                    // Proximity to center gives higher score
                    double distToCenter = Math.abs(s.getColumnNumber() - centerCol);
                    windowScore += (100 - distToCenter);
                    
                    // Premium/VIP boost
                    if (s.getSeatType() == SeatType.VIP) windowScore += 50;
                    if (s.getSeatType() == SeatType.RECLINER) windowScore += 40;
                    if (s.getSeatType() == SeatType.PREMIUM) windowScore += 20;
                }

                if (valid) {
                    pq.offer(new SeatRecommendation(window, windowScore));
                }
            }
        }

        if (pq.isEmpty()) {
            return Collections.emptyList();
        }

        return pq.poll().seats.stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void lockSeats(Long showId, List<Long> seatIds) {
        // HashSet to prevent duplicate seat selection in the request
        Set<Long> uniqueSeatIds = new HashSet<>(seatIds);
        if (uniqueSeatIds.size() != seatIds.size()) {
            throw new IllegalArgumentException("Duplicate seat IDs found in request");
        }

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new IllegalArgumentException("Invalid seat IDs");
        }

        for (Seat seat : seats) {
            if (!seat.getShow().getId().equals(showId)) {
                throw new IllegalArgumentException("Seat " + seat.getId() + " does not belong to show " + showId);
            }
            if (seat.getSeatStatus() != SeatStatus.AVAILABLE) {
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is currently " + seat.getSeatStatus());
            }
            seat.setSeatStatus(SeatStatus.LOCKED);
            // Will broadcast after transaction commit via SeatBroadcastService
            eventPublisher.publishEvent(new SeatStatusChangedEvent(showId, seat.getId(), seat.getSeatNumber(), SeatStatus.LOCKED, null));
        }

        // Save seats. OptimisticLockException will be thrown by Hibernate if version mismatch
        seatRepository.saveAll(seats);

        // Schedule lock expiration via Redis TTL
        for (Long seatId : seatIds) {
            redisTemplate.opsForValue().set("seat_lock:" + showId + ":" + seatId, seatId.toString(), Duration.ofMinutes(10));
        }
    }

    @Transactional
    public void releaseSeats(Long showId, List<Long> seatIds) {
        List<Seat> seats = seatRepository.findAllById(seatIds);
        for (Seat seat : seats) {
            if (seat.getSeatStatus() == SeatStatus.LOCKED) {
                seat.setSeatStatus(SeatStatus.AVAILABLE);
                redisTemplate.delete("seat_lock:" + showId + ":" + seat.getId());
                eventPublisher.publishEvent(new SeatStatusChangedEvent(showId, seat.getId(), seat.getSeatNumber(), SeatStatus.AVAILABLE, null));
            }
        }
        seatRepository.saveAll(seats);
    }

    @Transactional
    public void releaseLock(Long showId, Long seatId) {
        seatRepository.findById(seatId).ifPresent(seat -> {
            if (seat.getSeatStatus() == SeatStatus.LOCKED) {
                seat.setSeatStatus(SeatStatus.AVAILABLE);
                seatRepository.save(seat);
                eventPublisher.publishEvent(new SeatStatusChangedEvent(showId, seat.getId(), seat.getSeatNumber(), SeatStatus.AVAILABLE, null));
                log.info("Released expired lock for seat {}", seat.getSeatNumber());
            }
        });
    }

    // Helper class for Priority Queue
    private static class SeatRecommendation {
        List<Seat> seats;
        double score;

        public SeatRecommendation(List<Seat> seats, double score) {
            this.seats = seats;
            this.score = score;
        }

        public double getScore() {
            return score;
        }
    }
}
