package com.cinepass.mapper;

import com.cinepass.dto.SeatDto;
import com.cinepass.entity.Seat;
import org.springframework.stereotype.Component;

@Component
public class SeatMapper {
    public SeatDto toDto(Seat seat) {
        if (seat == null) return null;
        return SeatDto.builder()
                .id(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .rowLabel(seat.getRowLabel())
                .columnNumber(seat.getColumnNumber())
                .seatType(seat.getSeatType())
                .seatStatus(seat.getSeatStatus())
                .build();
    }
}
