package com.cinepass.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "daily_analytics")
public class DailyAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate analyticsDate;

    @Column(nullable = false)
    private Integer totalUsers;

    @Column(nullable = false)
    private Integer totalBookings;

    @Column(nullable = false)
    private Double totalRevenue;

    @Column(nullable = false)
    private Double occupancyRate;

    @Column(nullable = false)
    private Integer cancelledBookings;
}
