package com.cinepass.mapper;

import com.cinepass.dto.TheatreDto;
import com.cinepass.entity.Theatre;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TheatreMapper {
    TheatreDto toDto(Theatre theatre);
    Theatre toEntity(TheatreDto dto);
    List<TheatreDto> toDtoList(List<Theatre> theatres);
}
