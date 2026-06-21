package com.cinepass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowRequest {
    
    @NotNull(message = "TMDB Movie ID is required")
    private Integer tmdbMovieId;
    
    @NotNull(message = "Screen ID is required")
    private Long screenId;
    
    @NotNull(message = "Show date is required")
    private LocalDate showDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotNull(message = "Base price is required")
    private Double basePrice;
    
    @NotBlank(message = "Language is required")
    private String language;
    
    @NotBlank(message = "Format is required")
    private String format;
}
