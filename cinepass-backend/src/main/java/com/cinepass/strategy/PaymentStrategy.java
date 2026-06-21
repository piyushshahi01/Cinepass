package com.cinepass.strategy;

import com.cinepass.entity.Payment;
import com.cinepass.entity.PaymentMethod;

public interface PaymentStrategy {
    boolean supports(PaymentMethod method);
    Payment processPayment(Payment payment);
}
