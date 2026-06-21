package com.cinepass.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TicketCancelledEvent {
    private final Long ticketId;
}
