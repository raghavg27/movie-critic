import { useState, useEffect } from "react";
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
const apiUrl = "https://movie-critic-zdx3.onrender.com";

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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(
    movie ? movie.id : null
  );
  const [selectedMovieName, setSelectedMovieName] = useState("")
  const { toast } = useToast();

  useEffect(() => {
    if (!movie) {
      const fetchMovies = async () => {
        try {
          const response = await fetch(`${apiUrl}/movies`);
          if (!response.ok) throw new Error("Failed to fetch movies");
          const data = await response.json();
          setMovies(data);
        } catch (error) {
          console.error("Error fetching movies:", error);
          toast({
            title: "Error",
            description: "Failed to load movies",
            variant: "destructive",
          });
        }
      };
      fetchMovies();
    }
  }, [movie, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    onSubmit({
      movie_id: Number(selectedMovieId),
      reviewer_name: reviewerName || undefined,
      rating: ratingNum,
      review_comments: comments,
    });

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
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
          <Button type="submit" className="w-full">
            Submit Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
