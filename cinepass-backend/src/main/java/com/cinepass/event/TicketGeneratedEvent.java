package com.cinepass.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TicketGeneratedEvent {
    private final Long ticketId;
    private final Long bookingId;
}
