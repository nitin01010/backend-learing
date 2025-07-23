require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = require("./db/dataBase");
const { corsOptions } = require("./utils/config");
connectDB();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));


// Routes
app.use("/dapi/services", require("./routes/dashboard"));
app.use("/account/profile", require("./routes/user"));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});