/**
 * Generates mock showtimes for a given cinema and movie.
 * Uses a simple seeded random based on string hashes so the times 
 * remain consistent for the same cinema/movie combination.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function generateShowtimes(cinemaId, movieId = "default") {
  const seed = hashString(cinemaId + movieId);
  
  // Decide how many formats this theatre has (1 to 3)
  const numFormats = (seed % 3) + 1;
  const availableFormats = ["2D", "3D", "IMAX 2D", "IMAX 3D", "4DX 3D", "ScreenX"];
  
  const formats = [];
  
  for (let i = 0; i < numFormats; i++) {
    const formatName = availableFormats[(seed + i * 7) % availableFormats.length];
    
    // Number of shows for this format (2 to 5)
    const numShows = ((seed + i) % 4) + 2;
    const shows = [];
    
    for (let j = 0; j < numShows; j++) {
      // Generate realistic times
      const hour = 9 + ((seed + i * 3 + j * 5) % 14); // 9 AM to 11 PM
      const minuteOptions = ["00", "15", "30", "45"];
      const minute = minuteOptions[(seed + j * 7) % 4];
      
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const timeStr = `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
      
      const type = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
      
      const statusOptions = ["available", "available", "fast-filling", "almost-full"];
      const status = statusOptions[(seed + i + j) % statusOptions.length];
      
      shows.push({ time: timeStr, type, status, hour, minute });
    }
    
    // Sort shows by time
    shows.sort((a, b) => {
      const aTime = a.hour * 60 + parseInt(a.minute);
      const bTime = b.hour * 60 + parseInt(b.minute);
      return aTime - bTime;
    });
    
    formats.push({ name: formatName, shows });
  }
  
  return formats;
}
