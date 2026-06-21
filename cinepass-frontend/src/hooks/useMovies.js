import { useQuery } from "@tanstack/react-query";
import {
  getTrending, getPopular, getNowPlaying, getUpcoming,
  getTopRated, getMovieDetails, getGenres, searchMovies,
} from "../api/tmdb";

const STALE = 5 * 60 * 1000; // 5 min

export const useTrending   = (tw = "week")  => useQuery({ queryKey: ["trending", tw],    queryFn: () => getTrending(tw),    staleTime: STALE });
export const usePopular    = (page = 1)     => useQuery({ queryKey: ["popular", page],    queryFn: () => getPopular(page),   staleTime: STALE });
export const useNowPlaying = (page = 1)     => useQuery({ queryKey: ["now_playing", page],queryFn: () => getNowPlaying(page),staleTime: STALE });
export const useUpcoming   = (page = 1)     => useQuery({ queryKey: ["upcoming", page],   queryFn: () => getUpcoming(page),  staleTime: STALE });
export const useTopRated   = (page = 1)     => useQuery({ queryKey: ["top_rated", page],  queryFn: () => getTopRated(page),  staleTime: STALE });
export const useGenres     = ()             => useQuery({ queryKey: ["genres"],            queryFn: getGenres,                staleTime: 60 * 60 * 1000 });

export const useMovieDetails = (id, enabled = true) =>
  useQuery({ queryKey: ["movie", id], queryFn: () => getMovieDetails(id), staleTime: STALE, enabled: !!id && enabled });

export const useSearch = (query) =>
  useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMovies(query),
    staleTime: 60000,
    enabled: query?.trim().length > 1,
  });
