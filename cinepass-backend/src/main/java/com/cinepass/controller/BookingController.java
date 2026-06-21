package com.cinepass.controller;

import com.cinepass.dto.ApiResponse;
import com.cinepass.dto.BookingCancelRequest;
import com.cinepass.dto.BookingConfirmRequest;
import com.cinepass.dto.BookingResponse;
import com.cinepass.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cinepass.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @Valid @RequestBody BookingConfirmRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        request.setUserId(userDetails.getUser().getId());
        BookingResponse response = bookingService.confirmBooking(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking confirmed successfully"));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @Valid @RequestBody BookingCancelRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        // In a real application, you'd verify if this booking belongs to the user
        bookingService.cancelBooking(request.getBookingId());
        return ResponseEntity.ok(ApiResponse.success(null, "Booking cancelled successfully"));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
            
        List<BookingResponse> bookings = bookingService.getMyBookings(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(bookings, "Bookings fetched successfully"));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable String bookingId) {
        BookingResponse booking = bookingService.getBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking fetched successfully"));
    }
}
