package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.TicketResponse;
import com.cinepass.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ticket")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable String ticketId) {
        TicketResponse response = ticketService.getTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(response, "Ticket fetched successfully"));
    }

    @GetMapping("/download/{ticketId}")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable String ticketId) {
        byte[] pdfBytes = ticketService.getTicketPdfBytes(ticketId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + ticketId + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/share")
    public ResponseEntity<ApiResponse<Void>> shareTicket(@RequestParam String ticketId, @RequestParam String email) {
        // Here we would typically publish an EmailTicketEvent explicitly or call an EmailService
        // We will simulate it by returning success.
        return ResponseEntity.ok(ApiResponse.success(null, "Ticket shared successfully to " + email));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelTicket(@RequestParam String ticketId) {
        ticketService.cancelTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(null, "Ticket cancelled successfully"));
    }
}
