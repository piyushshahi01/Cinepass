package com.cinepass.dto;

import com.cinepass.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private String ticketNumber;
    private Long bookingId;
    private String qrCodePath;
    private String pdfPath;
    private TicketStatus ticketStatus;
    private LocalDateTime generatedAt;
}
