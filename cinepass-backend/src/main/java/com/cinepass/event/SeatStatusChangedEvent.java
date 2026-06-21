package com.cinepass.event;

import com.cinepass.entity.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SeatStatusChangedEvent {
    private final Long showId;
    private final Long seatId;
    private final String seatNumber;
    private final SeatStatus newStatus;
    private final Long userId; // Nullable
}
