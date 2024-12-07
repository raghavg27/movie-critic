// server.js
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const movieRoutes = require("./routes/movieRoutes")
const reviewRoutes = require("./routes/reviewRoutes");

// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json());

app.use("/movies", movieRoutes);
app.use("/reviews", reviewRoutes);

// Run the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});
