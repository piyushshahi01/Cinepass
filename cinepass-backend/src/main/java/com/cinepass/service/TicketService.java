package com.cinepass.service;

import com.cinepass.entity.Booking;
import com.cinepass.entity.Seat;
import com.cinepass.entity.Ticket;
import com.cinepass.entity.TicketStatus;
import com.cinepass.event.EmailTicketEvent;
import com.cinepass.event.TicketGeneratedEvent;
import com.cinepass.repository.BookingRepository;
import com.cinepass.repository.TicketRepository;
import com.cinepass.service.storage.FileStorageService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.io.image.ImageDataFactory;
import com.cinepass.dto.TicketResponse;
import com.cinepass.mapper.TicketMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final TicketMapper ticketMapper;

    @Async
    @Transactional
    public void generateTicket(Long bookingId) {
        log.info("Starting async ticket generation for booking ID: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (ticketRepository.findByBookingId(bookingId).isPresent()) {
            log.warn("Ticket already exists for booking ID: {}", bookingId);
            return;
        }

        String ticketNumber = "TKT-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        
        String seatNumbers = booking.getSeats().stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.joining(", "));

        String qrData = String.format("Ticket: %s | Booking: %s | Movie: %s | Seats: %s",
                ticketNumber, booking.getBookingId(), booking.getShow().getTmdbMovieId(), seatNumbers);

        try {
            // Generate QR Code
            byte[] qrCodeBytes = generateQrCode(qrData);
            String qrPath = fileStorageService.storeFile(qrCodeBytes, ticketNumber + ".png", "qr");

            // Generate PDF
            byte[] pdfBytes = generatePdf(ticketNumber, booking, qrCodeBytes, seatNumbers);
            String pdfPath = fileStorageService.storeFile(pdfBytes, ticketNumber + ".pdf", "pdf");

            Ticket ticket = Ticket.builder()
                    .ticketNumber(ticketNumber)
                    .booking(booking)
                    .qrCodePath(qrPath)
                    .pdfPath(pdfPath)
                    .ticketStatus(TicketStatus.ACTIVE)
                    .build();

            ticket = ticketRepository.save(ticket);
            
            log.info("Ticket successfully generated: {}", ticketNumber);

            eventPublisher.publishEvent(new TicketGeneratedEvent(ticket.getId(), booking.getId()));
            eventPublisher.publishEvent(new EmailTicketEvent(ticket.getId(), booking.getUser().getEmail()));

        } catch (Exception e) {
            log.error("Failed to generate ticket for booking ID: {}", bookingId, e);
        }
    }

    private byte[] generateQrCode(String data) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 300, 300);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    private byte[] generatePdf(String ticketNumber, Booking booking, byte[] qrCodeBytes, String seatNumbers) throws Exception {
        ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(pdfOutputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("CinePass Official Ticket").setBold().setFontSize(24));
        document.add(new Paragraph("Ticket Number: " + ticketNumber));
        document.add(new Paragraph("Booking ID: " + booking.getBookingId()));
        document.add(new Paragraph("Theatre: " + booking.getShow().getScreen().getTheatre().getName()));
        document.add(new Paragraph("Screen: " + booking.getShow().getScreen().getName()));
        document.add(new Paragraph("Date: " + booking.getShow().getShowDate()));
        document.add(new Paragraph("Time: " + booking.getShow().getStartTime()));
        document.add(new Paragraph("Seats: " + seatNumbers));

        Image qrImage = new Image(ImageDataFactory.create(qrCodeBytes));
        qrImage.setWidth(150);
        qrImage.setHeight(150);
        document.add(qrImage);

        document.close();
        return pdfOutputStream.toByteArray();
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicket(String ticketId) {
        return ticketRepository.findByTicketNumber(ticketId)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
    }

    @Transactional(readOnly = true)
    public byte[] getTicketPdfBytes(String ticketId) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        return fileStorageService.retrieveFile(ticket.getPdfPath());
    }

    @Transactional
    public void cancelTicket(String ticketId) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        if (ticket.getTicketStatus() == TicketStatus.CANCELLED) {
            throw new IllegalArgumentException("Ticket is already cancelled");
        }
        
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);
    }
}
