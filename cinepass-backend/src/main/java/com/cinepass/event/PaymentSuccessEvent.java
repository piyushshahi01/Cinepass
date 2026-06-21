package com.cinepass.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentSuccessEvent {
    private final String paymentId;
    private final Long bookingId;
}
