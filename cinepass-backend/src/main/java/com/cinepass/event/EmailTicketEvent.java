package com.cinepass.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailTicketEvent {
    private final Long ticketId;
    private final String emailAddress;
}
