package com.cinepass.dto;

import com.cinepass.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentInitiateRequest {
    @NotNull(message = "Booking ID cannot be null")
    private Long bookingId;

    @NotNull(message = "Payment method cannot be null")
    private PaymentMethod paymentMethod;
}
