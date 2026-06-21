import { useNowPlaying } from "../../hooks/useMovies";
import MovieCarousel from "../MovieCarousel";
import MovieCard from "../MovieCard";
import { SkeletonCard } from "../ui/SkeletonCard";

export default function NowPlayingSection({ onOpenDetail }) {
  const { data, isLoading } = useNowPlaying();
  const movies = data?.results || [];

  return (
    <MovieCarousel title="Now Playing in Theatres" eyebrow="CATCH THEM ON THE BIG SCREEN">
      {isLoading
        ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpenDetail={onOpenDetail} />)}
    </MovieCarousel>
  );
}
