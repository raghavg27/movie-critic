// Imports
const express = require("express");

// Initialisations
const app = express();

// Configuration
const PORT = 8080;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).send({
    "hello": "world",
  });
});

// Deploy
app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});
