import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Movie, Review } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const apiUrl = "http://localhost:8080";

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: Omit<Review, "id">) => void;
  movie: Movie | null;
}

export function ReviewForm({
  open,
  onOpenChange,
  onSubmit,
  movie,
}: ReviewFormProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(
    movie ? movie.id : null
  );
  const { toast } = useToast();

  // Fetch movies using React Query
  const {
    data: movies,
    isLoading,
    isError,
  } = useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/movies`);
      if (!response.ok) throw new Error("Failed to fetch movies");
      return response.json();
    },
    enabled: !movie, // Only fetch movies if no specific movie is provided
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedMovieId || !rating || !comments) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const ratingNum = Number(rating);
    if (ratingNum < 0 || ratingNum > 10) {
      toast({
        title: "Error",
        description: "Rating must be between 0 and 10",
        variant: "destructive",
      });
      return;
    }

    // Call the onSubmit prop with the review data
    onSubmit({
      movie_id: Number(selectedMovieId),
      reviewer_name: reviewerName || undefined,
      rating: ratingNum,
      review_comments: comments,
    });

    // Reset form fields and close the dialog
    setReviewerName("");
    setRating("");
    setComments("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {movie ? `Add Review for ${movie.name}` : "Add Review"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Movie selection dropdown (only shown if no specific movie is provided) */}
          {!movie && (
            <div className="space-y-2">
              <label htmlFor="movie" className="text-sm font-medium">
                Select Movie
              </label>
              <Select onValueChange={setSelectedMovieId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a movie" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading movies...
                    </SelectItem>
                  ) : isError ? (
                    <SelectItem value="error" disabled>
                      Failed to load movies
                    </SelectItem>
                  ) : (
                    movies?.map((movie) => (
                      <SelectItem key={movie.id} value={movie.id}>
                        {movie.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reviewer name input */}
          <div className="space-y-2">
            <label htmlFor="reviewerName" className="text-sm font-medium">
              Your Name (optional)
            </label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Rating input */}
          <div className="space-y-2">
            <label htmlFor="rating" className="text-sm font-medium">
              Rating (0-10)
            </label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Enter rating"
            />
          </div>

          {/* Review comments textarea */}
          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              Review Comments
            </label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write your review"
              rows={4}
            />
          </div>

          {/* Submit button */}
          <Button type="submit" className="w-full">
            Submit Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}