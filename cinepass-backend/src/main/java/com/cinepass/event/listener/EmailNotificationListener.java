package com.cinepass.event.listener;

import com.cinepass.entity.NotificationType;
import com.cinepass.entity.User;
import com.cinepass.event.EmailTicketEvent;
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
public class EmailNotificationListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void handleEmailTicket(EmailTicketEvent event) {
        log.info("Sending email to {} with ticket ID {}", event.getEmailAddress(), event.getTicketId());
        
        userRepository.findByEmail(event.getEmailAddress()).ifPresent(user -> {
            String title = "Your CinePass Ticket";
            String message = "Your ticket has been generated. You can download the PDF from the portal. Ticket ID: " + event.getTicketId();
            notificationService.createNotification(user, title, message, NotificationType.EMAIL);
        });
    }
}
