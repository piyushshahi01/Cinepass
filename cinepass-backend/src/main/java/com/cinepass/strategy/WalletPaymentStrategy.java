package com.cinepass.strategy;

import com.cinepass.entity.Payment;
import com.cinepass.entity.PaymentMethod;
import com.cinepass.entity.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
public class WalletPaymentStrategy implements PaymentStrategy {

    @Override
    public boolean supports(PaymentMethod method) {
        return method == PaymentMethod.WALLET;
    }

    @Override
    public Payment processPayment(Payment payment) {
        log.info("Processing Wallet payment for amount: {}", payment.getAmount());
        // Mock processing logic
        payment.setTransactionId("WALLET-" + UUID.randomUUID().toString());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        return payment;
    }
}
