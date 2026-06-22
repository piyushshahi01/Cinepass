package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.TheatreDto;
import com.cinepass.service.TheatreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
@RequiredArgsConstructor
public class TheatreController {

    private final TheatreService theatreService;
    private final com.cinepass.service.OverpassService overpassService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TheatreDto>>> getAllTheatres() {
        return ResponseEntity.ok(ApiResponse.success(theatreService.getAllTheatres(), "All theatres fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheatreDto>> getTheatreById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(theatreService.getTheatreById(id), "Theatre fetched successfully"));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<TheatreDto>>> getTheatresByCity(@PathVariable String city) {
        return ResponseEntity.ok(ApiResponse.success(theatreService.getTheatresByCity(city), "Theatres in city fetched successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<String> searchCinemasInCity(
            @RequestParam String city, 
            @RequestParam(defaultValue = "10000") int radius) {
        return ResponseEntity.ok(overpassService.searchCinemasInCity(city, radius));
    }

    @GetMapping("/nearby")
    public ResponseEntity<String> getNearbyCinemas(
            @RequestParam double lat, 
            @RequestParam double lng, 
            @RequestParam(defaultValue = "5000") int radius) {
        return ResponseEntity.ok(overpassService.getNearbyCinemas(lat, lng, radius));
    }
}
