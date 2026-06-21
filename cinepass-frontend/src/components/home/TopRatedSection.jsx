import { useTopRated } from "../../hooks/useMovies";
import MovieCarousel from "../MovieCarousel";
import MovieCard from "../MovieCard";
import { SkeletonCard } from "../ui/SkeletonCard";

export default function TopRatedSection({ onOpenDetail }) {
  const { data, isLoading } = useTopRated();
  const movies = data?.results || [];

  return (
    <MovieCarousel title="Critically Acclaimed" eyebrow="ALL-TIME MASTERPIECES">
      {isLoading
        ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpenDetail={onOpenDetail} />)}
    </MovieCarousel>
  );
}
