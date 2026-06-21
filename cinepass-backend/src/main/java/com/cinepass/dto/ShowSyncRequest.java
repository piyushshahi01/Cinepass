package com.cinepass.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ShowSyncRequest {
    private Integer movieId;
    private String movieTitle;
    private String theatreName;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;
    private String format;
    private LocalTime showTime;
    private LocalDate date;
}
