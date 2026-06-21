package com.cinepass.service;

import com.cinepass.dto.MovieDto;
import com.cinepass.entity.Booking;
import com.cinepass.entity.BookingStatus;
import com.cinepass.entity.DailyAnalytics;
import com.cinepass.repository.BookingRepository;
import com.cinepass.repository.DailyAnalyticsRepository;
import com.cinepass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final DailyAnalyticsRepository dailyAnalyticsRepository;
    private final UserRepository userRepository;
    private final MovieService movieService;

    // Cron expression for everyday at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void generateDailyAnalytics() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Generating daily analytics for {}", yesterday);
        
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.atTime(LocalTime.MAX);
        
        List<Booking> bookings = bookingRepository.findByCreatedAtBetween(startOfDay, endOfDay);
        
        int totalBookings = bookings.size();
        int cancelledBookings = (int) bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED).count();
        double totalRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getTotalAmount)
                .sum();
                
        // For occupancy rate, we would ideally need the total seats across all shows that day.
        // Assuming a mock or simplified calculation here for demonstration
        double occupancyRate = totalBookings > 0 ? 0.75 : 0.0; 
        
        int totalUsers = (int) userRepository.count();

        DailyAnalytics analytics = DailyAnalytics.builder()
                .analyticsDate(yesterday)
                .totalUsers(totalUsers)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .occupancyRate(occupancyRate)
                .cancelledBookings(cancelledBookings)
                .build();
                
        dailyAnalyticsRepository.save(analytics);
        log.info("Daily analytics generated for {}", yesterday);
    }

    public List<MovieDto> getPopularMovies() {
        // DSA: PriorityQueue (Min-Heap) to maintain top 10 movies
        List<Booking> recentBookings = bookingRepository.findByCreatedAtBetween(
                LocalDateTime.now().minusDays(30), LocalDateTime.now());
                
        // DSA: HashMap for revenue/booking aggregation
        Map<Integer, Integer> movieBookingCount = new HashMap<>();
        for (Booking b : recentBookings) {
            if (b.getBookingStatus() == BookingStatus.CONFIRMED) {
                int movieId = b.getShow().getTmdbMovieId();
                movieBookingCount.put(movieId, movieBookingCount.getOrDefault(movieId, 0) + 1);
            }
        }
        
        PriorityQueue<Map.Entry<Integer, Integer>> minHeap = new PriorityQueue<>(
                Comparator.comparingInt(Map.Entry::getValue)
        );
        
        for (Map.Entry<Integer, Integer> entry : movieBookingCount.entrySet()) {
            minHeap.offer(entry);
            if (minHeap.size() > 10) {
                minHeap.poll();
            }
        }
        
        List<MovieDto> popularMovies = new ArrayList<>();
        while (!minHeap.isEmpty()) {
            Integer movieId = minHeap.poll().getKey();
            try {
                popularMovies.add(movieService.getMovieById(movieId));
            } catch (Exception e) {
                log.warn("Failed to fetch movie details for ID {}", movieId);
            }
        }
        Collections.reverse(popularMovies); // Highest first
        return popularMovies;
    }

    public String getPeakHours() {
        // DSA: Sliding Window to find peak hours
        List<Booking> todayBookings = bookingRepository.findByCreatedAtBetween(
                LocalDate.now().atStartOfDay(), LocalDateTime.now());
                
        int[] hourlyBookings = new int[24];
        for (Booking b : todayBookings) {
            hourlyBookings[b.getCreatedAt().getHour()]++;
        }
        
        int maxBookings = 0;
        int peakStartHour = 0;
        int windowSize = 2; // 2 hour sliding window
        
        int currentWindowBookings = 0;
        for (int i = 0; i < windowSize; i++) {
            currentWindowBookings += hourlyBookings[i];
        }
        maxBookings = currentWindowBookings;
        
        for (int i = windowSize; i < 24; i++) {
            currentWindowBookings += hourlyBookings[i] - hourlyBookings[i - windowSize];
            if (currentWindowBookings > maxBookings) {
                maxBookings = currentWindowBookings;
                peakStartHour = i - windowSize + 1;
            }
        }
        
        return String.format("%02d:00 - %02d:00", peakStartHour, peakStartHour + windowSize);
    }

    public double getMonthlyRevenue(int year, int month, int startDay, int endDay) {
        // DSA: Prefix Sum array for O(1) range queries within a month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<DailyAnalytics> monthData = dailyAnalyticsRepository.findAll().stream()
                .filter(da -> da.getAnalyticsDate().getYear() == year && da.getAnalyticsDate().getMonthValue() == month)
                .sorted(Comparator.comparing(DailyAnalytics::getAnalyticsDate))
                .collect(Collectors.toList());
                
        int daysInMonth = startDate.lengthOfMonth();
        double[] prefixSum = new double[daysInMonth + 1];
        
        for (DailyAnalytics da : monthData) {
            int day = da.getAnalyticsDate().getDayOfMonth();
            prefixSum[day] = da.getTotalRevenue();
        }
        
        // Build prefix sum
        for (int i = 1; i <= daysInMonth; i++) {
            prefixSum[i] += prefixSum[i - 1];
        }
        
        if (startDay < 1) startDay = 1;
        if (endDay > daysInMonth) endDay = daysInMonth;
        
        return prefixSum[endDay] - prefixSum[startDay - 1];
    }
}
