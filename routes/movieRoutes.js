const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add a new movie
router.post("/", async (req, res) => {
  const { name, release_date, average_rating } = req.body;

  if (!name || !release_date) {
    return res.status(400).json({
      error: "Movie name and release date are required",
    });
  }

  const parsedDate = new Date(release_date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({
      error: "Invalid release date format",
    });
  }

  if (
    average_rating !== undefined &&
    (average_rating < 0 || average_rating > 10)
  ) {
    return res.status(400).json({
      error: "Average rating must be between 0 and 10",
    });
  }

  try {
    const newMovie = await prisma.movies.create({
      data: {
        name,
        release_date: parsedDate,
        average_rating: average_rating || null,
      },
    });

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

// Get all movies
router.get("/", async (req, res) => {
  try {
    const movies = await prisma.movies.findMany();
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({
      error: "Failed to fetch movies",
    });
  }
});

// Get a movie by ID
router.get("/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const movie = await prisma.movies.findUnique({
      where: {
        id: parseInt(movieId),
      },
    });

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found",
      });
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({
      error: "Failed to fetch movie",
    });
  }
});

// Update a movie by ID
router.put("/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const { name, release_date, average_rating } = req.body;

  if (!name || !release_date) {
    return res.status(400).json({
      error: "Movie name and release date are required",
    });
  }

  const parsedDate = new Date(release_date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({
      error: "Invalid release date format",
    });
  }

  if (
    average_rating !== undefined &&
    (average_rating < 0 || average_rating > 10)
  ) {
    return res.status(400).json({
      error: "Average rating must be between 0 and 10",
    });
  }

  try {
    const updatedMovie = await prisma.movies.update({
      where: {
        id: parseInt(movieId),
      },
      data: {
        name,
        release_date: parsedDate,
        average_rating: average_rating || null,
      },
    });

    res.status(200).json({
      message: "Movie updated successfully",
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Error updating movie:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Movie not found",
      });
    }
    res.status(500).json({
      error: "Failed to update movie",
    });
  }
});

// Delete a movie by ID
router.delete("/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const deletedMovie = await prisma.movies.delete({
      where: {
        id: parseInt(movieId),
      },
    });

    res.status(200).json({
      message: "Movie deleted successfully",
      movie: deletedMovie,
    });
  } catch (error) {
    console.error("Error deleting movie:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Movie not found",
      });
    }
    res.status(500).json({
      error: "Failed to delete movie",
    });
  }
});

// Get average rating for a movie
router.get("/:movieId/average-rating", async (req, res) => {
  const { movieId } = req.params;

  try {
    const movie = await prisma.movies.findUnique({
      where: {
        id: parseInt(movieId),
      },
      select: {
        average_rating: true,
      },
    });

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found",
      });
    }

    res.status(200).json({
      average_rating: movie.average_rating,
    });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    res.status(500).json({
      error: "Failed to fetch average rating",
    });
  }
});

// Get movies by search term (name)
router.get("/search", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      error: "Search term is required",
    });
  }

  try {
    const movies = await prisma.movies.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });

    res.status(200).json(movies);
  } catch (error) {
    console.error("Error searching for movies:", error);
    res.status(500).json({
      error: "Failed to search movies",
    });
  }
});

// Get top-rated movies
router.get("/top-rated", async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const topRatedMovies = await prisma.movies.findMany({
      where: {
        average_rating: {
          not: null,
        },
      },
      orderBy: {
        average_rating: "desc",
      },
      take: parseInt(limit),
    });

    res.status(200).json(topRatedMovies);
  } catch (error) {
    console.error("Error fetching top-rated movies:", error);
    res.status(500).json({
      error: "Failed to fetch top-rated movies",
    });
  }
});

module.exports = router;
