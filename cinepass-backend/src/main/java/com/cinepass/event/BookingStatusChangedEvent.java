package com.cinepass.event;

import com.cinepass.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class BookingStatusChangedEvent {
    private final String bookingId;
    private final Long showId;
    private final List<Long> seatIds;
    private final BookingStatus newStatus;
    private final Long userId;
}
