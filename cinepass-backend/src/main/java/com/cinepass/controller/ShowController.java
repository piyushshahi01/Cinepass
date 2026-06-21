package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.ShowRequest;
import com.cinepass.dto.ShowResponse;
import com.cinepass.dto.ShowSyncRequest;
import com.cinepass.dto.SyncResponse;
import com.cinepass.service.ShowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    // Public endpoints for shows
    @GetMapping("/api/shows")
    public ResponseEntity<ApiResponse<List<ShowResponse>>> getAllShows() {
        return ResponseEntity.ok(ApiResponse.success(showService.getAllShows(), "All shows fetched successfully"));
    }

    @GetMapping("/api/shows/{id}")
    public ResponseEntity<ApiResponse<ShowResponse>> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(showService.getShowById(id), "Show fetched successfully"));
    }

    @GetMapping("/api/shows/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<ShowResponse>>> getShowsByMovieId(@PathVariable Integer movieId) {
        return ResponseEntity.ok(ApiResponse.success(showService.getShowsByMovieId(movieId), "Shows for movie fetched successfully"));
    }

    @GetMapping("/api/shows/theatre/{theatreId}")
    public ResponseEntity<ApiResponse<List<ShowResponse>>> getShowsByTheatreId(@PathVariable Long theatreId) {
        return ResponseEntity.ok(ApiResponse.success(showService.getShowsByTheatreId(theatreId), "Shows for theatre fetched successfully"));
    }

    @GetMapping("/api/shows/date/{date}")
    public ResponseEntity<ApiResponse<List<ShowResponse>>> getShowsByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(showService.getShowsByDate(date), "Shows for date fetched successfully"));
    }

    @PostMapping("/api/shows/sync")
    public ResponseEntity<ApiResponse<SyncResponse>> syncShow(@RequestBody ShowSyncRequest request) {
        return ResponseEntity.ok(ApiResponse.success(showService.syncShow(request), "Show synced successfully"));
    }

    // Admin endpoints for shows
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/shows")
    public ResponseEntity<ApiResponse<ShowResponse>> createShow(@Valid @RequestBody ShowRequest request) {
        return ResponseEntity.ok(ApiResponse.success(showService.createShow(request), "Show created successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/admin/shows/{id}")
    public ResponseEntity<ApiResponse<ShowResponse>> updateShow(@PathVariable Long id, @Valid @RequestBody ShowRequest request) {
        return ResponseEntity.ok(ApiResponse.success(showService.updateShow(id, request), "Show updated successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/shows/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Show deleted successfully"));
    }
}
