package com.cinepass.dto;

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
public class ShowResponse {
    private Long id;
    private Integer tmdbMovieId;
    private ScreenDto screen;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double basePrice;
    private String language;
    private String format;
}
