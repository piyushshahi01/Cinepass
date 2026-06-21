package com.cinepass.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentFailureEvent {
    private final String paymentId;
    private final Long bookingId;
    private final String reason;
}
