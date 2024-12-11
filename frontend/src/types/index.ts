export interface Movie {
  id: string;
  name: string;
  releaseDate: string;
  averageRating: number | null;
}

export interface Review {
  id: string;
  movie_id: string;
  reviewer_name?: string;
  rating: number;
  review_comments: string;
}