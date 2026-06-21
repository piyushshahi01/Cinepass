package com.cinepass.dto;

import com.cinepass.entity.SeatStatus;
import com.cinepass.entity.SeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {
    private Long id;
    private String seatNumber;
    private String rowLabel;
    private Integer columnNumber;
    private SeatType seatType;
    private SeatStatus seatStatus;
}
