package com.cinepass.mapper;

import com.cinepass.dto.ScreenDto;
import com.cinepass.entity.Screen;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ScreenMapper {
    @Mapping(source = "theatre.id", target = "theatreId")
    ScreenDto toDto(Screen screen);

    @Mapping(source = "theatreId", target = "theatre.id")
    Screen toEntity(ScreenDto dto);

    List<ScreenDto> toDtoList(List<Screen> screens);
}
