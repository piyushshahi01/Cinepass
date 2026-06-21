package com.cinepass.service;

import com.cinepass.dto.TheatreDto;
import com.cinepass.entity.Theatre;
import com.cinepass.mapper.TheatreMapper;
import com.cinepass.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TheatreService {

    private final TheatreRepository theatreRepository;
    private final TheatreMapper theatreMapper;

    public List<TheatreDto> getAllTheatres() {
        return theatreMapper.toDtoList(theatreRepository.findAll());
    }

    @Cacheable(value = "theatres", key = "#id")
    public TheatreDto getTheatreById(Long id) {
        Theatre theatre = theatreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theatre not found"));
        return theatreMapper.toDto(theatre);
    }

    public List<TheatreDto> getTheatresByCity(String city) {
        return theatreMapper.toDtoList(theatreRepository.findByCityIgnoreCase(city));
    }
}
