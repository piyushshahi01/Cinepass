package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.MovieDto;
import com.cinepass.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getPopularMovies() {
        return ResponseEntity.ok(ApiResponse.success(movieService.getPopularMovies(), "Popular movies fetched successfully"));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getUpcomingMovies() {
        return ResponseEntity.ok(ApiResponse.success(movieService.getUpcomingMovies(), "Upcoming movies fetched successfully"));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getTrendingMovies() {
        return ResponseEntity.ok(ApiResponse.success(movieService.getTrendingMovies(), "Trending movies fetched successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MovieDto>>> searchMovies(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(movieService.searchMovies(query), "Search results fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDto>> getMovieById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(movieService.getMovieById(id), "Movie details fetched successfully"));
    }
}
