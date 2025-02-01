import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Movie, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/ReviewForm";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EditReviewModal } from "@/components/EditReviewModal";
import { MovieForm } from "@/components/MovieForm";

const apiUrl = "http://localhost:8080";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch movie details
  const {
    data: movie,
    isLoading: isMovieLoading,
    error: movieError,
  } = useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/movies/${id}`);
      if (!response.ok) throw new Error("Failed to fetch movie details");
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load movie details",
        variant: "destructive",
      });
    },
  });

  // Fetch reviews
  const {
    data: reviews,
    isLoading: isReviewsLoading,
    error: reviewsError,
  } = useQuery<Review[]>({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/reviews/movie/${id}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Expected an array of reviews");
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    },
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: Omit<Review, "id" | "movieId">) => {
      const response = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movie_id: Number(id),
          reviewer_name: reviewData.reviewer_name,
          rating: reviewData.rating,
          review_comments: reviewData.review_comments,
        }),
      });
      if (!response.ok) throw new Error("Failed to add review");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Review added successfully",
      });
      setIsAddReviewOpen(false);
      queryClient.invalidateQueries(["reviews", id]);
      queryClient.invalidateQueries(["movie", id]); // Refetch movie details to update average_rating
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete review");
      return reviewId;
    },
    onSuccess: (reviewId) => {
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      queryClient.invalidateQueries(["reviews", id]);
      queryClient.invalidateQueries(["movie", id]); // Refetch movie details to update average_rating
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const handleAddReview = (reviewData: Omit<Review, "id" | "movieId">) => {
    addReviewMutation.mutate(reviewData);
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  const handleEditReview = (review: Review) => {
    setCurrentReview(review);
    setIsEditReviewOpen(true);
  };

  if (isMovieLoading || isReviewsLoading) {
    return <div>Loading...</div>;
  }

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-secondary py-4 px-6 mb-8">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">MOVIECRITIC</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100"
              onClick={() => setIsAddMovieOpen(true)}
            >
              Add new movie
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => setIsAddReviewOpen(true)}
            >
              Add new review
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold">{movie.name}</h1>
            <p className="text-4xl font-bold text-primary">
              {movie.average_rating
                ? Number(movie.average_rating).toFixed(1)
                : "N/A"}{" "}
              / 10
            </p>
          </div>

          <div className="space-y-4 mt-8">
            {reviews?.length === 0 ? (
              <p>No reviews yet. Be the first to leave a review!</p>
            ) : (
              reviews?.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg p-6 shadow-sm space-y-2 border"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-lg">{review.review_comments}</p>
                    <p className="text-xl font-bold text-primary">
                      {review.rating}/10
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground italic">
                      By {review.reviewer_name}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditReview(review)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReview(review.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <ReviewForm
            open={isAddReviewOpen}
            onOpenChange={setIsAddReviewOpen}
            onSubmit={handleAddReview}
            movie={movie}
          />

          <MovieForm
            open={isAddMovieOpen}
            onOpenChange={setIsAddMovieOpen}
            onSubmit={(movieData) => {}}
          />

          <EditReviewModal
            open={isEditReviewOpen}
            onClose={() => {
              setIsEditReviewOpen(false);
              setCurrentReview(null); // Reset the current review
            }}
            review={currentReview}
            onSave={(updatedReview) =>{
              // Invalidate queries to refetch data
              queryClient.invalidateQueries(["reviews", id]);
              queryClient.invalidateQueries(["movie", id]);
              toast({
                title: "Success",
                description: "Review updated successfully",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
