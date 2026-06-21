package com.cinepass.service;

import com.cinepass.dto.ShowRequest;
import com.cinepass.dto.ShowResponse;
import com.cinepass.dto.ShowSyncRequest;
import com.cinepass.dto.SyncResponse;
import com.cinepass.entity.*;
import com.cinepass.mapper.ShowMapper;
import com.cinepass.repository.ScreenRepository;
import com.cinepass.repository.SeatRepository;
import com.cinepass.repository.ShowRepository;
import com.cinepass.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowService {

    private final ShowRepository showRepository;
    private final ScreenRepository screenRepository;
    private final TheatreRepository theatreRepository;
    private final SeatRepository seatRepository;
    private final ShowMapper showMapper;

    public List<ShowResponse> getAllShows() {
        return showMapper.toDtoList(showRepository.findAll());
    }

    @Cacheable(value = "shows", key = "#id")
    public ShowResponse getShowById(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found"));
        return showMapper.toDto(show);
    }

    public List<ShowResponse> getShowsByMovieId(Integer movieId) {
        return showMapper.toDtoList(showRepository.findByTmdbMovieId(movieId));
    }

    public List<ShowResponse> getShowsByTheatreId(Long theatreId) {
        return showMapper.toDtoList(showRepository.findByScreen_Theatre_Id(theatreId));
    }

    public List<ShowResponse> getShowsByDate(LocalDate date) {
        return showMapper.toDtoList(showRepository.findByShowDate(date));
    }

    @Transactional
    @CacheEvict(value = "shows", allEntries = true)
    public ShowResponse createShow(ShowRequest request) {
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        if (showRepository.hasOverlappingShows(screen.getId(), request.getShowDate(), request.getStartTime(), request.getEndTime())) {
            throw new RuntimeException("Overlapping show exists for this screen and time");
        }

        Show show = Show.builder()
                .tmdbMovieId(request.getTmdbMovieId())
                .screen(screen)
                .showDate(request.getShowDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .basePrice(request.getBasePrice())
                .language(request.getLanguage())
                .format(request.getFormat())
                .build();

        return showMapper.toDto(showRepository.save(show));
    }

    @Transactional
    @CacheEvict(value = "shows", key = "#id")
    public ShowResponse updateShow(Long id, ShowRequest request) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found"));

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        if (showRepository.hasOverlappingShowsExcludingId(screen.getId(), request.getShowDate(), request.getStartTime(), request.getEndTime(), show.getId())) {
            throw new RuntimeException("Overlapping show exists for this screen and time");
        }

        show.setTmdbMovieId(request.getTmdbMovieId());
        show.setScreen(screen);
        show.setShowDate(request.getShowDate());
        show.setStartTime(request.getStartTime());
        show.setEndTime(request.getEndTime());
        show.setBasePrice(request.getBasePrice());
        show.setLanguage(request.getLanguage());
        show.setFormat(request.getFormat());

        return showMapper.toDto(showRepository.save(show));
    }

    @Transactional
    @CacheEvict(value = "shows", key = "#id")
    public void deleteShow(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found"));
        showRepository.delete(show);
    }

    @Transactional
    public SyncResponse syncShow(ShowSyncRequest request) {
        // 1. Check or Create Theatre
        List<Theatre> theatres = theatreRepository.findByCityIgnoreCase(request.getCity());
        Theatre theatre = theatres.stream()
                .filter(t -> t.getName().equalsIgnoreCase(request.getTheatreName()))
                .findFirst()
                .orElse(null);

        if (theatre == null) {
            theatre = Theatre.builder()
                    .name(request.getTheatreName())
                    .city(request.getCity())
                    .address(request.getAddress() != null ? request.getAddress() : "Address not provided")
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 0.0)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 0.0)
                    .rating(4.5)
                    .build();
            theatre = theatreRepository.save(theatre);
        }

        // 2. Check or Create Screen
        List<Screen> screens = screenRepository.findByTheatreId(theatre.getId());
        Screen screen = screens.stream().findFirst().orElse(null);

        if (screen == null) {
            screen = Screen.builder()
                    .name("Screen 1")
                    .type(ScreenType.TWO_D)
                    .capacity(60)
                    .theatre(theatre)
                    .build();
            screen = screenRepository.save(screen);
        }

        // 3. Check or Create Show
        // Assuming end time is 3 hours after start time
        java.time.LocalTime endTime = request.getShowTime().plusHours(3);
        
        final Screen finalScreen = screen;
        
        List<Show> existingShows = showRepository.findByScreen_Theatre_Id(theatre.getId());
        Show show = existingShows.stream()
                .filter(s -> s.getTmdbMovieId().equals(request.getMovieId())
                        && s.getShowDate().equals(request.getDate())
                        && s.getStartTime().equals(request.getShowTime())
                        && s.getScreen().getId().equals(finalScreen.getId()))
                .findFirst()
                .orElse(null);

        if (show == null) {
            show = Show.builder()
                    .tmdbMovieId(request.getMovieId())
                    .screen(screen)
                    .showDate(request.getDate())
                    .startTime(request.getShowTime())
                    .endTime(endTime)
                    .basePrice(250.0)
                    .language("English")
                    .format(request.getFormat() != null ? request.getFormat() : "2D")
                    .build();
            show = showRepository.save(show);

            // 4. Generate Seats for the new Show
            // Match the frontend SEAT_MAP exactly
            String[] rows = {"A", "B", "C", "D", "E", "F"};
            for (String rowLabel : rows) {
                SeatType type = SeatType.REGULAR;
                if (rowLabel.equals("A") || rowLabel.equals("B")) type = SeatType.VIP;
                else if (rowLabel.equals("C") || rowLabel.equals("D")) type = SeatType.PREMIUM;
                
                int[] layout = (rowLabel.equals("A") || rowLabel.equals("C") || rowLabel.equals("F"))
                        ? new int[]{0,1,1,1,1,0,0,1,1,1,1,0}
                        : new int[]{1,1,1,1,1,1,1,1,1,1,1,1};
                        
                int seatNumCounter = 1;
                for (int c = 0; c < layout.length; c++) {
                    if (layout[c] == 1) {
                        Seat seat = Seat.builder()
                                .seatNumber(rowLabel + "-" + seatNumCounter)
                                .rowLabel(rowLabel)
                                .columnNumber(c + 1)
                                .seatType(type)
                                .seatStatus(SeatStatus.AVAILABLE)
                                .show(show)
                                .build();
                        seatRepository.save(seat);
                        seatNumCounter++;
                    }
                }
            }
        }

        return SyncResponse.builder()
                .showId(show.getId())
                .screenId(screen.getId())
                .theatreId(theatre.getId())
                .build();
    }
}
