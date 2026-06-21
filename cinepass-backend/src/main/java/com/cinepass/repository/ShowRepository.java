package com.cinepass.repository;

import com.cinepass.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {
    
    List<Show> findByTmdbMovieId(Integer tmdbMovieId);
    
    List<Show> findByScreen_Theatre_Id(Long theatreId);
    
    List<Show> findByShowDate(LocalDate showDate);
    
    @Query("SELECT COUNT(s) > 0 FROM Show s WHERE s.screen.id = :screenId AND s.showDate = :date " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean hasOverlappingShows(@Param("screenId") Long screenId, 
                                @Param("date") LocalDate date, 
                                @Param("startTime") LocalTime startTime, 
                                @Param("endTime") LocalTime endTime);
                                
    @Query("SELECT COUNT(s) > 0 FROM Show s WHERE s.screen.id = :screenId AND s.showDate = :date " +
           "AND s.startTime < :endTime AND s.endTime > :startTime AND s.id != :excludeId")
    boolean hasOverlappingShowsExcludingId(@Param("screenId") Long screenId, 
                                           @Param("date") LocalDate date, 
                                           @Param("startTime") LocalTime startTime, 
                                           @Param("endTime") LocalTime endTime,
                                           @Param("excludeId") Long excludeId);
}
