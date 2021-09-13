const express = require('express');
const cors = require('cors');

const feedRoutes = require('./routes/feed.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/feed', feedRoutes);

app.listen(8080, () => console.log('Server running...'))