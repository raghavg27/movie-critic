// Imports
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const movieRoutes = require("./routes/movieRoutes")
const reviewRoutes = require("./routes/reviewRoutes");

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
