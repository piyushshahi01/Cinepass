package com.cinepass.service;

import com.cinepass.dto.ScreenDto;
import com.cinepass.entity.Screen;
import com.cinepass.mapper.ScreenMapper;
import com.cinepass.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;
    private final ScreenMapper screenMapper;

    public List<ScreenDto> getAllScreens() {
        return screenMapper.toDtoList(screenRepository.findAll());
    }

    public ScreenDto getScreenById(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Screen not found"));
        return screenMapper.toDto(screen);
    }

    public List<ScreenDto> getScreensByTheatreId(Long theatreId) {
        return screenMapper.toDtoList(screenRepository.findByTheatreId(theatreId));
    }
}
