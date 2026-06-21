package com.cinepass.mapper;

import com.cinepass.dto.TicketResponse;
import com.cinepass.entity.Ticket;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {
    public TicketResponse toResponse(Ticket ticket) {
        if (ticket == null) return null;
        return TicketResponse.builder()
                .ticketNumber(ticket.getTicketNumber())
                .bookingId(ticket.getBooking().getId())
                .qrCodePath(ticket.getQrCodePath())
                .pdfPath(ticket.getPdfPath())
                .ticketStatus(ticket.getTicketStatus())
                .generatedAt(ticket.getGeneratedAt())
                .build();
    }
}
