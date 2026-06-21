package com.cinepass.dto;

import com.cinepass.entity.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatUpdateMessage {
    private Long showId;
    private Long seatId;
    private String seatNumber;
    private SeatStatus seatStatus;
    private Long userId; // Nullable if released anonymously
    private String timestamp;
}
