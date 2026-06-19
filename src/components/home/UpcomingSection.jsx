import { useUpcoming } from "../../hooks/useMovies";
import MovieCarousel from "../MovieCarousel";
import MovieCard from "../MovieCard";
import { SkeletonCard } from "../ui/SkeletonCard";

export default function UpcomingSection({ onOpenDetail }) {
  const { data, isLoading } = useUpcoming();
  const movies = data?.results || [];

  return (
    <MovieCarousel title="Coming Soon" eyebrow="MARK YOUR CALENDARS">
      {isLoading
        ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpenDetail={onOpenDetail} />)}
    </MovieCarousel>
  );
}
