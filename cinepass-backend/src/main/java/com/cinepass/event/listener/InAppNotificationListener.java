package com.cinepass.event.listener;

import com.cinepass.entity.NotificationType;
import com.cinepass.entity.User;
import com.cinepass.event.BookingStatusChangedEvent;
import com.cinepass.event.EmailTicketEvent;
import com.cinepass.event.PaymentSuccessEvent;
import com.cinepass.repository.UserRepository;
import com.cinepass.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InAppNotificationListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void handleBookingStatusChanged(BookingStatusChangedEvent event) {
        userRepository.findById(event.getUserId()).ifPresent(user -> {
            String title = "Booking " + event.getNewStatus();
            String message = "Your booking " + event.getBookingId() + " has been " + event.getNewStatus().name().toLowerCase() + ".";
            notificationService.createNotification(user, title, message, NotificationType.IN_APP);
        });
    }

    @Async
    @EventListener
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        // Find user by booking
        // Here we just mock or we can get user from booking
    }
}
