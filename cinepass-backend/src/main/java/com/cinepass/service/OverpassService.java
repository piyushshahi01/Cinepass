package com.cinepass.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class OverpassService {

    private final RestTemplate restTemplate;
    private static final String OVERPASS_URL = "https://overpass-api.de/api/interpreter";

    public OverpassService() {
        this.restTemplate = new RestTemplate();
    }

    public String searchCinemasInCity(String city, int radius) {
        String query = String.format("""
            [out:json][timeout:30];
            area["name"="%s"]["place"~"city|town|state"]["boundary"~"administrative"]->.searchArea;
            (
              node["amenity"="cinema"](area.searchArea);
              way["amenity"="cinema"](area.searchArea);
            );
            out center tags;
            """, city);
        return executeQuery(query);
    }

    public String getNearbyCinemas(double lat, double lng, int radius) {
        String query = String.format("""
            [out:json][timeout:25];
            (
              node["amenity"="cinema"](around:%d,%f,%f);
              way["amenity"="cinema"](around:%d,%f,%f);
              relation["amenity"="cinema"](around:%d,%f,%f);
            );
            out center tags;
            """, radius, lat, lng, radius, lat, lng, radius, lat, lng);
        return executeQuery(query);
    }

    private String executeQuery(String query) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Accept", "application/json");

            String encodedQuery = "data=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            HttpEntity<String> request = new HttpEntity<>(encodedQuery, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(OVERPASS_URL, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch data from Overpass API", e);
        }
    }
}
