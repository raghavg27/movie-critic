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

const apiUrl = "http://localhost:8080";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isDeleteMovie, setIsDeleteMovie] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    },
  });

  // Automatically refetch movies when isAddMovieOpen, isAddReviewOpen, or isDeleteMovie changes
  useEffect(() => {
    queryClient.invalidateQueries(["movies"]);
  }, [isAddMovieOpen, isAddReviewOpen, isDeleteMovie, queryClient]);

  const filteredMovies =
    movies?.filter((movie) =>
      movie.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Handle adding a new review
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
      toast({
        title: "Success",
        description: "Review added successfully",
      });
      setIsAddReviewOpen(false);
      queryClient.invalidateQueries(["movies"]);
    },
    onError: (error) => {
      console.error("Error adding review:", error);
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    },
  });

  const handleAddReview = async (reviewData: Omit<Movie, "id" | "movieId">) => {
    addReviewMutation.mutate(reviewData);
  };

  // Delete movie
  const deleteMovieMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/movies/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete movie");
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Success",
        description: "Deleted movie",
      });
      setIsDeleteMovie(true);
      queryClient.invalidateQueries(["movies"]);
    },
    onError: (error) => {
      console.error("Error deleting movie:", error);
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (id: string) => {
    deleteMovieMutation.mutate(id);
  };

  const handleEdit = (movie: Movie) => {
    setCurrentMovie(movie);
    setIsEditModalOpen(true);
  };

  const handleSaveMovie = (updatedMovie: Movie) => {
    setMovies(
      movies?.map((movie) =>
        movie.id === updatedMovie.id ? updatedMovie : movie
      ) || []
    );
  };

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

          {isLoading ? (
            <p className="text-center text-gray-500 mt-8">Loading...</p>
          ) : filteredMovies.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              Free instance spins down with inactivity, which can delay requests
              by 50 seconds or more. Please Wait.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <MovieForm
          open={isAddMovieOpen}
          onOpenChange={setIsAddMovieOpen}
          onSubmit={(movieData) => {}}
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
