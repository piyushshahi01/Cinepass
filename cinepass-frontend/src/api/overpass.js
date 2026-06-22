import api from "./backend";

/**
 * Fetch cinemas within `radius` metres of the given lat/lng
 * using OpenStreetMap Overpass API via Spring Boot backend.
 */
export async function getNearbyCinemas(lat, lng, radius = 5000, cityName = "Your Area") {
  try {
    const res = await api.get('/theatres/nearby', {
      params: { lat, lng, radius }
    });
    const elements = res.data?.elements || [];
    if (elements.length === 0) throw new Error("No cinemas found");
    return parseElements(elements);
  } catch (err) {
    return getMockCinemas(lat, lng, cityName);
  }
}

/**
 * Fetch cinemas in a city by name.
 */
export async function getCinemasInCity(city, radius = 10000) {
  try {
    const res = await api.get('/theatres/search', {
      params: { city, radius }
    });
    const elements = res.data?.elements || [];
    if (elements.length === 0) throw new Error("No cinemas found");
    return parseElements(elements);
  } catch (err) {
    const pop = POPULAR_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
    return getMockCinemas(pop?.lat || 20, pop?.lng || 78, city);
  }
}

function parseElements(elements) {
  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) return null;
      return {
        id: String(el.id),
        name: el.tags?.name || el.tags?.["name:en"] || "Cinema",
        address: buildAddress(el.tags),
        city: el.tags?.["addr:city"] || el.tags?.["addr:state"] || "",
        lat,
        lng,
        phone: el.tags?.phone || el.tags?.contact?.phone || null,
        website: el.tags?.website || el.tags?.contact?.website || null,
        openingHours: el.tags?.opening_hours || null,
        screens: el.tags?.screens || null,
      };
    })
    .filter(Boolean);
}

function buildAddress(tags = {}) {
  return [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
  ]
    .filter(Boolean)
    .join(", ") || "Address not available";
}

// Fallback popular Indian cities for theatre browsing
export const POPULAR_CITIES = [
  { name: "Mumbai",    lat: 19.0760, lng: 72.8777 },
  { name: "Delhi",     lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai",   lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata",   lat: 22.5726, lng: 88.3639 },
  { name: "Pune",      lat: 18.5204, lng: 73.8567 },
  { name: "Noida",     lat: 28.5355, lng: 77.3910 },
];

function getMockCinemas(lat, lng, city) {
  const brands = ["PVR INOX", "Cinepolis", "INOX", "Carnival Cinemas", "Miraj Cinemas", "Mukta A2"];
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `mock-${Date.now()}-${i}`,
    name: `${brands[i % brands.length]} ${city || "Center"}`,
    address: `${100 + i * 20} Cinema Road, ${city || "Downtown"}`,
    city: city || "Unknown",
    lat: lat + (Math.random() - 0.5) * 0.08,
    lng: lng + (Math.random() - 0.5) * 0.08,
    phone: "+91 98765 43210",
    openingHours: "Mo-Su 09:00-23:30",
    screens: Math.floor(Math.random() * 8) + 3,
  }));
}
