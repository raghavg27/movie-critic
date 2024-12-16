// Imports
const express = require("express");
const prisma = new PrismaClient();

// Initialisations
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

// Add a review
router.post("/", async (req, res) => {
  const { movie_id, reviewer_name, rating, review_comments } = req.body;

  // Validate
  if (!movie_id || !rating) {
    return res.status(400).json({ error: "Movie ID and rating are required" });
  }

  // rating is within bounds (0-10)
  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "Rating must be between 0 and 10" });
  }

  try {
    // Check if the movie exists
    const movie = await prisma.movies.findUnique({
      where: { id: movie_id },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Create a new review
    const newReview = await prisma.reviews.create({
      data: {
        movie_id,
        reviewer_name,
        rating: parseFloat(rating),
        review_comments,
      },
    });

    // Fetch the updated average rating from the movie
    const updatedMovie = await prisma.movies.findUnique({
      where: { id: movie_id },
      select: { name: true, average_rating: true },
    });

    // Respond with the new review and updated movie details
    res.status(201).json({
      review: newReview,
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

// Get all reviews for a movie
router.get("/movie/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const reviews = await prisma.reviews.findMany({
      where: { movie_id: parseInt(movieId) },
    });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ error: "No reviews found for this movie" });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Get a specific review by ID
router.get("/:reviewId", async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await prisma.reviews.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

// Update a review by ID
router.put("/:reviewId", async (req, res) => {
  const { reviewId } = req.params;
  const { reviewer_name, rating, review_comments } = req.body;

  // rating is within bounds (0-10)
  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "Rating must be between 0 and 10" });
  }

  try {
    const updatedReview = await prisma.reviews.update({
      where: { id: parseInt(reviewId) },
      data: {
        reviewer_name,
        rating: parseFloat(rating),
        review_comments,
      },
    });

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Delete a review by ID
router.delete("/:reviewId", async (req, res) => {
  const { reviewId } = req.params;

  try {
    const deletedReview = await prisma.reviews.delete({
      where: { id: parseInt(reviewId) },
    });

    res.status(200).json({
      message: "Review deleted successfully",
      review: deletedReview,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Get reviews by reviewer name
router.get("/search", async (req, res) => {
  const { reviewer_name } = req.query;

  if (!reviewer_name) {
    return res.status(400).json({
      error: "Reviewer name is required to search",
    });
  }

  try {
    const reviews = await prisma.reviews.findMany({
      where: {
        reviewer_name: {
          contains: reviewer_name,
          mode: "insensitive",
        },
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error searching for reviews:", error);
    res.status(500).json({ error: "Failed to search reviews" });
  }
});

module.exports = router;
