package com.cinepass.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SyncResponse {
    private Long showId;
    private Long screenId;
    private Long theatreId;
}
