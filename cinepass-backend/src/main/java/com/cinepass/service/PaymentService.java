package com.cinepass.service;

import com.cinepass.dto.PaymentInitiateRequest;
import com.cinepass.dto.PaymentResponse;
import com.cinepass.entity.Booking;
import com.cinepass.entity.Payment;
import com.cinepass.entity.PaymentStatus;
import com.cinepass.event.PaymentFailureEvent;
import com.cinepass.event.PaymentSuccessEvent;
import com.cinepass.mapper.PaymentMapper;
import com.cinepass.repository.BookingRepository;
import com.cinepass.repository.PaymentRepository;
import com.cinepass.strategy.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final List<PaymentStrategy> paymentStrategies;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;

    @Transactional
    public PaymentResponse initiatePayment(PaymentInitiateRequest request) {
        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Check for duplicate payment attempt
        Optional<Payment> existingPaymentOpt = paymentRepository.findByBookingId(booking.getId());
        if (existingPaymentOpt.isPresent()) {
            Payment existingPayment = existingPaymentOpt.get();
            if (existingPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalStateException("Payment already successful for this booking");
            }
            // If pending or processing, we might reject or allow retry depending on logic.
            // For now, fail if not failed/cancelled.
            if (existingPayment.getPaymentStatus() == PaymentStatus.PENDING || existingPayment.getPaymentStatus() == PaymentStatus.PROCESSING) {
                throw new IllegalStateException("A payment is already in progress for this booking");
            }
        }

        Payment payment = existingPaymentOpt.orElseGet(() -> Payment.builder()
                .paymentId("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .booking(booking)
                .amount(booking.getTotalAmount())
                .build());

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PROCESSING);
        
        Payment savedPayment = paymentRepository.save(payment);

        PaymentStrategy strategy = paymentStrategies.stream()
                .filter(s -> s.supports(request.getPaymentMethod()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported payment method: " + request.getPaymentMethod()));

        try {
            // Process payment (Mocked in this iteration)
            savedPayment = strategy.processPayment(savedPayment);
            savedPayment = paymentRepository.save(savedPayment);
            
            if (savedPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                eventPublisher.publishEvent(new PaymentSuccessEvent(savedPayment.getPaymentId(), booking.getId()));
            } else {
                eventPublisher.publishEvent(new PaymentFailureEvent(savedPayment.getPaymentId(), booking.getId(), "Payment gateway rejected"));
            }
        } catch (Exception e) {
            log.error("Payment failed", e);
            savedPayment.setPaymentStatus(PaymentStatus.FAILED);
            savedPayment = paymentRepository.save(savedPayment);
            eventPublisher.publishEvent(new PaymentFailureEvent(savedPayment.getPaymentId(), booking.getId(), e.getMessage()));
        }

        return paymentMapper.toResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    }
}
