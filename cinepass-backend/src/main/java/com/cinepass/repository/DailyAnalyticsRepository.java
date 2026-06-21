package com.cinepass.repository;

import com.cinepass.entity.DailyAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyAnalyticsRepository extends JpaRepository<DailyAnalytics, Long> {
    Optional<DailyAnalytics> findByAnalyticsDate(LocalDate date);
}
