package com.cinepass.mapper;

import com.cinepass.dto.BookingResponse;
import com.cinepass.entity.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final SeatMapper seatMapper;
    private final ShowMapper showMapper;

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .show(showMapper.toDto(booking.getShow()))
                .userId(booking.getUser().getId())
                .seats(booking.getSeats().stream().map(seatMapper::toDto).collect(Collectors.toList()))
                .totalAmount(booking.getTotalAmount())
                .bookingStatus(booking.getBookingStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
