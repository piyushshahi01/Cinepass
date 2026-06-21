package com.cinepass.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingCancelRequest {
    @NotBlank(message = "Booking ID cannot be blank")
    private String bookingId;
}
