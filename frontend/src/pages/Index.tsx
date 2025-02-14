import { useState, useEffect } from "react";
import { Movie } from "@/types";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovieForm } from "@/components/MovieForm";
import { ReviewForm } from "@/components/ReviewForm";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EditMovieModal } from "@/components/EditMovieModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SkeletonMovieCard from "@/components/SkeletonMovieCard";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

// Generate unique placeholder movies
const placeholderMovies: Movie[] = Array.from({ length: 3  }, (_, index) => ({
  id: `placeholder-${index}`, // Unique ID for each placeholder
  name: "Loading...",
  average_rating: 0,
}));

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isDeleteMovie, setIsDeleteMovie] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch movies with placeholder data
  const {
    data: movies,
    error,
    isLoading,
  } = useQuery<Movie[], Error>({
    queryKey: ["movies"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/movies`);
      if (!response.ok) throw new Error("Failed to fetch movies");
      return response.json();
    },
    placeholderData: () => placeholderMovies, // Temporary data while loading
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    },
  });

  // Auto refetch movies when add/delete state changes
  useEffect(() => {
    queryClient.invalidateQueries(["movies"]);
  }, [isAddMovieOpen, isAddReviewOpen, isDeleteMovie, queryClient]);

  const filteredMovies =
    movies?.filter((movie) =>
      movie.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Add Review Mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: Omit<Movie, "id" | "movieId">) => {
      const response = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error("Failed to add review");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Review added successfully" });
      setIsAddReviewOpen(false);
      queryClient.invalidateQueries(["movies"]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    },
  });

  const handleAddReview = (reviewData: Omit<Movie, "id" | "movieId">) => {
    addReviewMutation.mutate(reviewData);
  };

  // Delete Movie Mutation
  const deleteMovieMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/movies/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete movie");
      return id;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Movie deleted successfully" });
      setIsDeleteMovie(true);
      queryClient.invalidateQueries(["movies"]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMovieMutation.mutate(id);
  };

  const handleEdit = (movie: Movie) => {
    setCurrentMovie(movie);
    setIsEditModalOpen(true);
  };

  const handleSaveMovie = () => {
    queryClient.invalidateQueries(["movies"]);
  };

  // Determine whether to show placeholders or real data
  const showPlaceholders = isLoading;
  const displayMovies = showPlaceholders ? placeholderMovies : filteredMovies;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">MOVIECRITIC</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 border-primary text-primary"
              onClick={() => setIsAddMovieOpen(true)}
            >
              Add new movie
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsAddReviewOpen(true)}
            >
              Add new review
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800">
            The best movie reviews site!
          </h2>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              className="pl-10 h-12 text-lg border-primary"
              placeholder="Search for your favourite movie"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showPlaceholders
              ? placeholderMovies.map((movie) => (
                  <SkeletonMovieCard key={movie.id} />
                ))
              : displayMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
          </div>
        </div>

        <MovieForm
          open={isAddMovieOpen}
          onOpenChange={setIsAddMovieOpen}
          onSubmit={() => {}}
        />

        <ReviewForm
          open={isAddReviewOpen}
          onOpenChange={setIsAddReviewOpen}
          onSubmit={handleAddReview}
          movie={null}
        />

        <EditMovieModal
          open={isEditModalOpen}
          movie={currentMovie}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveMovie}
        />
      </div>
    </div>
  );
};

export default Index;
