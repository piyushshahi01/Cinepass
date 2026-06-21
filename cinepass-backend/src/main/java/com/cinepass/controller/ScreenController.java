package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.ScreenDto;
import com.cinepass.service.ScreenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class ScreenController {

    private final ScreenService screenService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScreenDto>>> getAllScreens() {
        return ResponseEntity.ok(ApiResponse.success(screenService.getAllScreens(), "All screens fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScreenDto>> getScreenById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(screenService.getScreenById(id), "Screen fetched successfully"));
    }

    @GetMapping("/theatre/{theatreId}")
    public ResponseEntity<ApiResponse<List<ScreenDto>>> getScreensByTheatreId(@PathVariable Long theatreId) {
        return ResponseEntity.ok(ApiResponse.success(screenService.getScreensByTheatreId(theatreId), "Screens for theatre fetched successfully"));
    }
}
