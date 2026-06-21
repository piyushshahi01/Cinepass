package com.cinepass.dto;

import com.cinepass.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String bookingId;
    private ShowResponse show;
    private Long userId;
    private List<SeatDto> seats;
    private Double totalAmount;
    private BookingStatus bookingStatus;
    private LocalDateTime createdAt;
}
