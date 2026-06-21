import axios from "axios";

const BASE  = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN    || "";
export const IMG = import.meta.env.VITE_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

const tmdb = axios.create({
  baseURL: BASE,
  timeout: 10000,
  headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
});

// ── Image helpers ─────────────────────────────────────────────────────────
export const poster    = (path, size = "w500")  => path ? `${IMG}/${size}${path}` : null;
export const backdrop  = (path, size = "w1280") => path ? `${IMG}/${size}${path}` : null;
export const avatar    = (path, size = "w185")  => path ? `${IMG}/${size}${path}` : null;
export const original  = (path)                 => path ? `${IMG}/original${path}` : null;

// ── Movie lists ───────────────────────────────────────────────────────────
export const getTrending   = (tw = "week")  => tmdb.get(`/trending/movie/${tw}`).then(r => r.data);
export const getPopular    = (page = 1)     => tmdb.get("/movie/popular",     { params: { page } }).then(r => r.data);
export const getNowPlaying = (page = 1)     => tmdb.get("/movie/now_playing", { params: { page } }).then(r => r.data);
export const getUpcoming   = (page = 1)     => tmdb.get("/movie/upcoming",    { params: { page } }).then(r => r.data);
export const getTopRated   = (page = 1)     => tmdb.get("/movie/top_rated",   { params: { page } }).then(r => r.data);

// ── Movie detail (all data in one request via append_to_response) ─────────
export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, {
    params: { append_to_response: "credits,videos,reviews,similar,images,keywords,release_dates" },
  }).then(r => r.data);

// ── Standalone endpoints ──────────────────────────────────────────────────
export const getMovieVideos   = (id) => tmdb.get(`/movie/${id}/videos`).then(r => r.data);
export const getMovieCredits  = (id) => tmdb.get(`/movie/${id}/credits`).then(r => r.data);
export const getSimilarMovies = (id) => tmdb.get(`/movie/${id}/similar`).then(r => r.data);

// ── Genres ────────────────────────────────────────────────────────────────
export const getGenres = () => tmdb.get("/genre/movie/list").then(r => r.data.genres);

// ── Search & Discover ────────────────────────────────────────────────────────
export const searchMovies = (query, page = 1) =>
  tmdb.get("/search/movie", { params: { query, page, include_adult: false } }).then(r => r.data);

export const discoverMovies = (params) => 
  tmdb.get("/discover/movie", { params: { include_adult: false, ...params } }).then(r => r.data);

// ── Helpers ───────────────────────────────────────────────────────────────
export const getTrailerKey = (videos = []) => {
  const list = (videos?.results || videos);
  const trailer = list.find(v => v.site === "YouTube" && v.type === "Trailer")
    || list.find(v => v.site === "YouTube" && v.type === "Teaser")
    || list.find(v => v.site === "YouTube");
  return trailer?.key || null;
};

export const formatRuntime = (mins) => {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export const getYear = (dateStr) => dateStr ? new Date(dateStr).getFullYear() : null;

export const getRating = (v) => v ? Number(v).toFixed(1) : "—";

export default tmdb;
