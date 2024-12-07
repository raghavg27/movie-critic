const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// add a review
router.post("/", async (req, res) => {
  const { movie_id, reviewer_name, rating, review_comments } = req.body;

  // validate input data
  if (!movie_id || !rating) {
    return res.status(400).json({ error: "Movie ID and rating are required" });
  }

  // validate that rating is within bounds (0-10)
  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "Rating must be between 0 and 10" });
  }

  try {
    // check if the movie exists
    const movie = await prisma.movies.findUnique({
      where: { id: movie_id },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // create a new review
    const newReview = await prisma.reviews.create({
      data: {
        movie_id,
        reviewer_name,
        rating: parseFloat(rating),
        review_comments,
      },
    });

    // fetch the updated average rating from the movie
    const updatedMovie = await prisma.movies.findUnique({
      where: { id: movie_id },
      select: { name: true, average_rating: true },
    });

    // respond with the new review and updated movie details
    res.status(201).json({
      review: newReview,
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

module.exports = router;
