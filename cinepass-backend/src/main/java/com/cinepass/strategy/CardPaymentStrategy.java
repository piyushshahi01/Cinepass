package com.cinepass.strategy;

import com.cinepass.entity.Payment;
import com.cinepass.entity.PaymentMethod;
import com.cinepass.entity.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
public class CardPaymentStrategy implements PaymentStrategy {

    @Override
    public boolean supports(PaymentMethod method) {
        return method == PaymentMethod.CREDIT_CARD || method == PaymentMethod.DEBIT_CARD;
    }

    @Override
    public Payment processPayment(Payment payment) {
        log.info("Processing Card payment for amount: {}", payment.getAmount());
        // Mock processing logic
        payment.setTransactionId("CARD-" + UUID.randomUUID().toString());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        return payment;
    }
}
