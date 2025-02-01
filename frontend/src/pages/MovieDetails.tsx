import { useState, useEffect } from "react";
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
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);

  const { toast } = useToast();

  const fetchMovieDetails = () => {
    if (!id) return;

    fetch(`${apiUrl}/movies/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setMovie(data);
      })
      .catch((error) => {
        console.error("Error getting movie:", error);
        toast({
          title: "Error",
          description: "Failed to get movie details",
          variant: "destructive",
        });
      });
  };


  const fetchReviews = () => {
    if (!id) return;

    fetch(`${apiUrl}/reviews/movie/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        } else {
          console.error("Expected an array of reviews, but received:", data);
          setReviews([]);
        }
      })
      .catch((error) => {
        console.error("Error getting reviews:", error);
        toast({
          title: "Error",
          description: "Failed to get reviews",
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
  }, [id, toast]);

  // Handle adding a new review
  const handleAddReview = (reviewData: Omit<Review, "id" | "movieId">) => {
    fetch(`${apiUrl}/reviews`, {
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
    })
      .then((response) => response.json())
      .then((data) => {
        setReviews((prevReviews) => [...prevReviews, data.review]);
        toast({
          title: "Success",
          description: "Review added successfully",
        });

        // Refetch movie details to update the average_rating
        fetchMovieDetails();
      })
      .catch((error) => {
        console.error("Error adding review:", error);
        toast({
          title: "Error",
          description: "Failed to add review",
          variant: "destructive",
        });
      });
  };

  // Handle deleting a review
  const handleDeleteReview = (reviewId: string) => {
    fetch(`${apiUrl}/reviews/${reviewId}`, {
      method: "DELETE",
    })
      .then(() => {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId)
        );
        fetchMovieDetails();
        toast({
          title: "Success",
          description: "Review deleted successfully",
        });
      })
      .catch((error) => {
        console.error("Error deleting review:", error);
        toast({
          title: "Error",
          description: "Failed to delete review",
          variant: "destructive",
        });
      });
  };

  const handleEditReview = (review: Review) => {
    setCurrentReview(review);
    setIsEditReviewOpen(true);
  };

  const handleSaveReview = (updatedReview: Review) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
    fetchMovieDetails(); // Refetch movie details to update average_rating
  };


  console.log("Current movie state: ", movie);

  if (!movie) {
    return <div>Loading...</div>;
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
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to leave a review!</p>
            ) : (
              reviews.map((review) => (
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
            onClose={() => setIsEditReviewOpen(false)}
            review={currentReview}
            onSave={handleSaveReview}
          />
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
