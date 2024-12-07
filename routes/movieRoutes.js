const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// add a new movie
router.post("/", async (req, res) => {
  const { name, release_date, average_rating } = req.body;

  // validate
  if (!name || !release_date) {
    return res.status(400).json({
      error: "Movie name and release date are required",
    });
  }

  // validate the release date
  const parsedDate = new Date(release_date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({
      error: "Invalid release date format",
    });
  }

  // validate average_rating
  if (
    average_rating !== undefined &&
    (average_rating < 0 || average_rating > 10)
  ) {
    return res.status(400).json({
      error: "Average rating must be between 0 and 10",
    });
  }

  try {
    // Insert the new movie into the database
    const newMovie = await prisma.movies.create({
      data: {
        name,
        release_date: parsedDate,
        average_rating: average_rating || null, // Default to null if not provided
      },
    });

    // Return the newly created movie in the response
    res.status(201).json({
      message: "Movie added successfully",
      movie: newMovie,
    });
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).json({
      error: "Failed to add movie",
    });
  }
});

module.exports = router;
