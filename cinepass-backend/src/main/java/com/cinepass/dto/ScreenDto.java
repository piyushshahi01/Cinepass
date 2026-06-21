package com.cinepass.dto;

import com.cinepass.entity.ScreenType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenDto {
    private Long id;
    private String name;
    private ScreenType type;
    private Integer capacity;
    private Long theatreId;
}
