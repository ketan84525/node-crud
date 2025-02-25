const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoute');
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes (API Endpoints)
app.use("/api", contactRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
