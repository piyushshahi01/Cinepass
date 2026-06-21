package com.cinepass.controller;

import com.cinepass.dto.*;
import com.cinepass.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/show/{showId}")
    public ResponseEntity<ApiResponse<SeatDto[][]>> getSeatMatrix(@PathVariable Long showId) {
        SeatDto[][] matrix = seatService.getSeatMatrix(showId);
        return ResponseEntity.ok(ApiResponse.success(matrix, "Seat matrix fetched successfully"));
    }

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<List<SeatDto>>> recommendSeats(@Valid @RequestBody SeatRecommendationRequest request) {
        List<SeatDto> recommendations = seatService.recommendSeats(request.getShowId(), request.getSeatCount());
        return ResponseEntity.ok(ApiResponse.success(recommendations, "Seats recommended successfully"));
    }

    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<Void>> lockSeats(@Valid @RequestBody SeatLockRequest request) {
        seatService.lockSeats(request.getShowId(), request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.success(null, "Seats locked successfully"));
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> releaseSeats(@Valid @RequestBody SeatReleaseRequest request) {
        seatService.releaseSeats(request.getShowId(), request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.success(null, "Seats released successfully"));
    }
}
