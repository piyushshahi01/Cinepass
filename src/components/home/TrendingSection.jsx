import { useTrending } from "../../hooks/useMovies";
import MovieCarousel from "../MovieCarousel";
import MovieCard from "../MovieCard";
import { SkeletonCard } from "../ui/SkeletonCard";

export default function TrendingSection({ onOpenDetail }) {
  const { data, isLoading } = useTrending("day");
  const movies = data?.results || [];

  return (
    <MovieCarousel title="Trending Today" eyebrow="HOTTEST RIGHT NOW">
      {isLoading
        ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpenDetail={onOpenDetail} />)}
    </MovieCarousel>
  );
}
