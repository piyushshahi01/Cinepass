package com.cinepass.service;

import com.cinepass.dto.MovieDto;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final RestTemplate restTemplate;

    @Value("${TMDB_API_KEY:fake-key-for-now}")
    private String tmdbApiKey;

    private final String BASE_URL = "https://api.themoviedb.org/3";
    private final String IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    private final String BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

    public List<MovieDto> getPopularMovies() {
        return fetchMovies("/movie/popular");
    }

    public List<MovieDto> getUpcomingMovies() {
        return fetchMovies("/movie/upcoming");
    }

    public List<MovieDto> getTrendingMovies() {
        return fetchMovies("/trending/movie/day");
    }

    public List<MovieDto> searchMovies(String query) {
        return fetchMovies("/search/movie?query=" + query);
    }

    @Cacheable(value = "movies", key = "#id")
    public MovieDto getMovieById(Integer id) {
        String url = BASE_URL + "/movie/" + id + "?api_key=" + tmdbApiKey;
        try {
            ResponseEntity<TmdbMovie> response = restTemplate.getForEntity(url, TmdbMovie.class);
            if (response.getBody() != null) {
                return mapToDto(response.getBody());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        throw new RuntimeException("Movie not found");
    }

    private List<MovieDto> fetchMovies(String endpoint) {
        String url = BASE_URL + endpoint + (endpoint.contains("?") ? "&" : "?") + "api_key=" + tmdbApiKey;
        try {
            ResponseEntity<TmdbResponse> response = restTemplate.getForEntity(url, TmdbResponse.class);
            if (response.getBody() != null && response.getBody().getResults() != null) {
                return response.getBody().getResults().stream()
                        .map(this::mapToDto)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    private MovieDto mapToDto(TmdbMovie tmdbMovie) {
        return MovieDto.builder()
                .tmdbId(tmdbMovie.getId())
                .title(tmdbMovie.getTitle())
                .overview(tmdbMovie.getOverview())
                .posterUrl(tmdbMovie.getPoster_path() != null ? IMAGE_BASE_URL + tmdbMovie.getPoster_path() : null)
                .backdropUrl(tmdbMovie.getBackdrop_path() != null ? BACKDROP_BASE_URL + tmdbMovie.getBackdrop_path() : null)
                .releaseDate(tmdbMovie.getRelease_date())
                .rating(tmdbMovie.getVote_average())
                .language(tmdbMovie.getOriginal_language())
                // Basic mapping, missing genres string list for now
                .build();
    }

    @Data
    private static class TmdbResponse {
        private List<TmdbMovie> results;
    }

    @Data
    private static class TmdbMovie {
        private Integer id;
        private String title;
        private String overview;
        private String poster_path;
        private String backdrop_path;
        private String release_date;
        private Double vote_average;
        private String original_language;
    }
}
