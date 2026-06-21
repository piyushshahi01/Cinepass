package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.MovieDto;
import com.cinepass.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AnalyticsService analyticsService;

    @GetMapping("/popular-movies")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getPopularMovies() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPopularMovies(), "Popular movies fetched successfully"));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<ApiResponse<String>> getPeakHours() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPeakHours(), "Peak hours fetched successfully"));
    }

    @GetMapping("/trigger-daily-analytics")
    public ResponseEntity<ApiResponse<Void>> triggerDailyAnalytics() {
        analyticsService.generateDailyAnalytics();
        return ResponseEntity.ok(ApiResponse.success(null, "Daily analytics generated successfully"));
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<ApiResponse<Double>> getMonthlyRevenue(
            @org.springframework.web.bind.annotation.RequestParam int year,
            @org.springframework.web.bind.annotation.RequestParam int month,
            @org.springframework.web.bind.annotation.RequestParam int startDay,
            @org.springframework.web.bind.annotation.RequestParam int endDay) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getMonthlyRevenue(year, month, startDay, endDay),
                "Monthly revenue fetched successfully"));
    }
}
