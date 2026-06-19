import { useState, useCallback } from "react";
import { getNearbyCinemas, getCinemasInCity, POPULAR_CITIES } from "../api/overpass";
import { reverseGeocode } from "../api/nominatim";

export function useTheatres() {
  const [theatres, setTheatres]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [city, setCity]           = useState("");
  const [userCoords, setUserCoords] = useState(null);

  const fetchByCoords = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const [cinemas, cityName] = await Promise.all([
        getNearbyCinemas(lat, lng, 8000),
        reverseGeocode(lat, lng),
      ]);
      setTheatres(cinemas);
      setCity(cityName);
      setUserCoords({ lat, lng });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCity = useCallback(async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const cinemas = await getCinemasInCity(cityName, 15000);
      setTheatres(cinemas);
      setCity(cityName);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchByCoords(coords.latitude, coords.longitude),
      () => {
        setError("Location denied");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, [fetchByCoords]);

  return {
    theatres, loading, error, city, userCoords,
    fetchByCity, fetchByCoords, requestLocation,
    popularCities: POPULAR_CITIES,
  };
}
