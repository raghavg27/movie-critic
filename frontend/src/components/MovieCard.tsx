import { Movie } from "@/types";
import { Card } from "./ui/card";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

interface MovieCardProps {
  movie: Movie;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
}

export function MovieCard({ movie, onEdit, onDelete }: MovieCardProps) {
  const averageRating = !isNaN(Number(movie.average_rating))
    ? Number(movie.average_rating).toFixed(2)
    : "N/A";

  const queryClient = useQueryClient();

  const prefetchReviews = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["reviews", String(movie.id)],
      queryFn: async () => {
        try {
          const response = await fetch(`${apiUrl}/reviews/movie/${movie.id}`);
          if (!response.ok) throw new Error("Failed to fetch reviews");

          const data = await response.json();
          if (!Array.isArray(data))
            throw new Error("Expected an array of reviews");

          console.log(
            `Prefetched reviews for movie ${movie.id}: , ${typeof movie.id}`,
            data
          );
          return data;
        } catch (error) {
          console.error("Prefetch error:", error);
          return [];
        }
      },
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    });

    // Verify if data is in cache
    const cachedData = queryClient.getQueryData(["reviews", Number(movie.id)]);
    console.log(
      `Cached reviews in movie card for ${movie.id}:`,
      cachedData
    );
  };

  return (
    <Card
      className="bg-[#E0DEFD] p-6 space-y-4 hover:shadow-md transition-shadow duration-200"
      onMouseEnter={prefetchReviews}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <h3 className="text-xl font-semibold text-gray-800">{movie.name}</h3>
        <p className="text-sm text-gray-600 italic mt-1">
          Released: {formatDate(movie.release_date)}
        </p>
        {averageRating !== "N/A" && (
          <p className="text-lg font-medium text-gray-800 mt-2">
            Rating: {averageRating}/10
          </p>
        )}
      </Link>
      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(movie)}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(String(movie.id))}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
