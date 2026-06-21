package com.cinepass.mapper;

import com.cinepass.dto.ShowResponse;
import com.cinepass.entity.Show;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ScreenMapper.class})
public interface ShowMapper {
    ShowResponse toDto(Show show);
    List<ShowResponse> toDtoList(List<Show> shows);
}
