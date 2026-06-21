package com.cinepass.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeatRecommendationRequest {
    @NotNull(message = "Show ID cannot be null")
    private Long showId;

    @Min(value = 1, message = "Seat count must be at least 1")
    private Integer seatCount;
}
