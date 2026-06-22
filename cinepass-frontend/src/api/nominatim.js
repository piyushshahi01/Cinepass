import axios from "axios";

const BASE = "https://nominatim.openstreetmap.org";

const nom = axios.create({
  baseURL: BASE,
  headers: { "Accept-Language": "en", "User-Agent": "OneCinema/1.0" },
  timeout: 8000,
});

/** Convert lat/lng → city name */
export async function reverseGeocode(lat, lng) {
  const res = await nom.get("/reverse", {
    params: { lat, lon: lng, format: "json", zoom: 10 },
  });
  const addr = res.data.address || {};
  return (
    addr.city || addr.town || addr.village || addr.county || addr.state || "Unknown"
  );
}

/** City name → { lat, lng } */
export async function geocodeCity(city) {
  const res = await nom.get("/search", {
    params: { q: city, format: "json", limit: 1 },
  });
  const hit = res.data[0];
  if (!hit) throw new Error(`City not found: ${city}`);
  return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) };
}
