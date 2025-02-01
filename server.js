// Imports
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const movieRoutes = require("./routes/movieRoutes")
const reviewRoutes = require("./routes/reviewRoutes");
const prisma = require("./prisma/prismaClient");

// Initialisation
const app = express();

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

// Routes
app.use("/movies", movieRoutes);
app.use("/reviews", reviewRoutes);

// Deploy
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server... Closing database connection.");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Server terminated. Disconnecting database...");
  await prisma.$disconnect();
  process.exit(0);
});