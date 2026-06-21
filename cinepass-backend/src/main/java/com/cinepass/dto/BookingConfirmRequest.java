package com.cinepass.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BookingConfirmRequest {
    @NotNull(message = "Show ID cannot be null")
    private Long showId;

    @NotEmpty(message = "Seat IDs cannot be empty")
    private List<Long> seatIds;
    
    // We get User from Security Context in real system, but for now we might need to pass or assume.
    // If not using Spring Security yet, we'll pass userId.
    @NotNull(message = "User ID cannot be null")
    private Long userId;
}
